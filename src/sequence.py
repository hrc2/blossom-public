import json
import pypot.primitive
import time
import copy
import numpy as np
import os

class Sequence:
    """
    Sequence of Frames to be loaded/stored/played back
    """
    seq = ''
    seq_name = ''
    frames = []

    def __init__(self, seq_name, frames=[]):
        self.seq_name = seq_name
        self.frames = frames

    @classmethod
    def from_json(cls, seq_fn, rad=False):
        """
        Init from json file
        args:
            seq_fn  filename of the sequence to load
            rad     whether in radians
        returns:
            loaded sequence
        """
        # open sequence
        seq_f = open(seq_fn)
        seq = json.load(seq_f)

        # get relative path from robot's directory
        robot_dir = seq_fn.find('sequences')+len('sequences')+1
        seq_fn = seq_fn[seq_fn[robot_dir:].find('/'):]

        # sequence name includes subdirectory (e.g. grand/grand9)
        seq_name = seq_fn[robot_dir+1:seq_fn.rfind('_')]

        seq_f.close()
        return cls(seq_name, cls.convert_frames(seq, rad))

    @staticmethod
    def convert_frames(seq, rad=False):
        """
        Convert from json to pythonesque list of frames
        args:
            rad     whether in radians
        returns:
            list of Frame objects
        """
        # get json frame list
        frame_list = seq['frame_list']
        num_frames = len(frame_list)

        # init lists for frames
        frames = []
        # go through all frames
        for t in range(0, num_frames):
            # get current frame and make Frame object
            cur_frame = Frame.from_json(frame_list[t])
            # if json file defines position in rad
            if (rad):
                cur_frame.rad_to_angle()
            frames.append(cur_frame)
        return frames

    @staticmethod
    def append(f):
        """
        Append frame
        args:
            f   the frame to add
        """
        frames.append(f)

    # convert to list
    # include DoFs, times, and motor positions
    # assume DoFs are ordered and static throughout the sequence
    @staticmethod
    def to_list():
        """
        Return sequence as a tuple for numerical analysis
        returns:
            (list of DoFs, list of Frame times, list of Frame positions)
        """
        # get DoFs from first frame
        f_0 = frames[0]
        dofs = f_0.positions.keys()

        # init lists of times and motor positions
        millis_list = []
        motor_pos_list = []

        # iterate through all frames
        for f in frames:
            # add time
            millis_list.append(f.millis)
            # add positions
            motor_pos_list.append(f.positions.values())

        return (dofs, millis_list, motor_pos_list)

class Frame:
    """
    Frame that defines position of robot at a given time
    """
    # time
    millis = 0
    # dict {motor_name:position}
    positions = {}

    # init
    def __init__(self, millis, positions):
        self.millis = millis
        self.positions = positions

    @classmethod
    def from_json(cls, f):
        """
        Parse json
        args:
            f   the frame to parse
        """
        # get time
        millis = f['millis']

        # iterate through all dofs
        num_dof = len(f['positions'])
        positions = {}
        for i in range(0, num_dof):
            cur_dof = f['positions'][i]
            positions.update({
              str(cur_dof['dof']): float(cur_dof['pos'])
            })
        # call initializer
        return cls(millis, positions)

    def rad_to_angle(self):
        """
        Convert from radians to angle
        """
        # iterate through all positions
        for k, p in self.positions.iteritems():
            self.positions[k] = (p - 3) * 50


# sequence primitive to play back movements
# handles sequences that run once or loop (idlers)
class SequencePrimitive(pypot.primitive.LoopPrimitive):
    """
    PyPot Primitive to handle Sequence playback
    """
    def __init__(self, robot, seq, seq_stop, idler=False, speed=1.0, amp = 1.0):
        # the robot object (extends PyPot.Robot)
        self.Robot = robot 
        # the PyPot.Robot object
        self.robot = robot.robot
        # the Sequence
        self.seq = seq
        # stop flag
        self.seq_stop = seq_stop
        # current motor positions
        self.motor_pos = self.Robot.get_motor_pos
        # whether idler or not
        self.idler = idler
        # playback speed
        self.speed = speed
        # playback amplitude
        self.amp = amp

        # not idler
        if (not self.idler):
            # create primitive once
            pypot.primitive.Primitive.__init__(self, robot.robot)
            self.run = self.play
        # idler
        else:
            # get time of last frame
            # use this to determine repetition frequency
            frames = self.seq.frames
            last_frame = frames[-1]
            last_millis = last_frame.millis
            self.loop_freq = last_millis / 1000.0

            # create primitive as a loop w/ designated frequency set by time of last Frame
            pypot.primitive.LoopPrimitive.__init__(self, robot.robot, self.loop_freq)
            self.update = self.play

    def play(self):
        """
        Play sequence
        """
        # get frames
        frames = self.seq.frames

        # start time
        start_time = time.time()
        # init time
        cur_time = 0

        # iterate through all frames
        for f in frames:

            # check if should stop
            if (self.seq_stop.is_set()):
                self.stop()
                break

            # get time delay until next frame
            cur_time = (time.time()-start_time)*1000.0
            # factor for the speed, make sure not 0
            t_delay_millis = (f.millis/max(self.speed,0.1) - cur_time)
            # skip if behind
            if (t_delay_millis<0):
                continue
            if (t_delay_millis == 0):
                t_delay_millis = 200
            t_delay = t_delay_millis / 1000.0

            # TODO: adjust amplitude

            # remove dofs that are not on robot
            # TODO make this cleaner
            # dofs that are in the robot config
            motor_dof = self.Robot.motors.keys()
            # dofs that are in the commanded position
            frame_dof = f.positions.keys()

            # remove dofs from commanded position that are in robot config
            for m_dof in motor_dof:
                try:
                    [frame_dof.remove(m_dof)]
                except ValueError:
                    # print("Cannot remove DoF: "+m_dof)
                    pass
            f_copy = copy.copy(f)
            [f_copy.positions.pop(k, None) for k in frame_dof]

            # move robot
            # print t_delay, f_copy.positions

            # get the robot's current position
            self.motor_pos = self.Robot.get_motor_pos()
            # get desired position
            next_pos = f_copy.positions
            # find distance to travel for each motor
            d_pos = {}
            # iterate through all motors
            for dof_key in next_pos.keys():
                # get difference between goal and current position
                motor_pos_dof = self.motor_pos[dof_key]
                next_pos_dof = next_pos[dof_key]
                # add distance to dictionary
                d_pos.update({dof_key:np.abs(next_pos_dof-motor_pos_dof)})
            # map distance to velocity
            # vel = np.interp(del_pos,[0,100],[0,1])

            # self.robot.goto_position(next_pos, duration=t_delay*(1.0/vel), wait=False)
            # command each motor
            for m,p in next_pos.iteritems():
                # calculate the velocity by which to scale the time delay
                vel = np.interp(d_pos[m],[0,100],[0.1,1])

                # hotfix for base 4 rotation
                if (m=='base'):
                    vel = np.interp(d_pos[m],[0,200],[0.5,1])
                # command the motor
                # the time delay is used to determine the velocity,
                # but don't actually wait for it
                self.robot.goto_position({m:p},duration=t_delay*(1.0/vel), wait=False)
            time.sleep(t_delay)

            # show difference taken between time according to frame and actual time to execute
            # print time.time()-start
        if (not self.idler):
            self.stop()

class RecorderPrimitive(pypot.primitive.Primitive):
    """
    Record Sequences in real time
    """
    # init lists for frames and Frame objects
    frames = []
    frames_list = []

    # init
    def __init__(self, robot, rec_stop):
        # robot object
        self.Robot = robot
        # pypot robot object
        self.robot = robot.robot
        self.motor_pos = self.Robot.believed_motor_pos
        self.rec_stop = rec_stop
        # how many motors to record
        self.num_motors = len(self.Robot.believed_motor_pos)
        # init arrays
        self.frames = []
        self.frames_list = []

        # attach primitive
        pypot.primitive.Primitive.__init__(self, robot.robot)

    def run(self):
        """
        Infinitely executing and recording frames as fast as possible
        """
        # add frame to frames
        self.Robot.set_compliant(False)

        # loop until thread stopper is set
        while(1):
            # handle stopper
            if (self.rec_stop.is_set()):
                self.teardown()
                return

            # get time
            millis = int(self.elapsed_time*1000)
            # get believed motor position
            motor_pos = self.Robot.believed_motor_pos

            # create frame
            f = Frame(millis, motor_pos)

            # add frame to frames
            self.frames.append(f)
            # add frame to json-savable list
            self.frames_list.append({
              'millis': float(millis),
              'positions': [{'dof': k, 'pos': v / 50.0 + 3} for k, v in motor_pos.iteritems()]
            })
            time.sleep(0.1)

    def save_rec(self, seq_name, robots=[], tmp=False):
        """
        Save the recorded sequence
        args:
            seq_name    name of the sequence
            robots      list of robots to save this sequence to
            tmp         whether this sequence is temporary
        returns:
            list of Frames
        """
        # check if empty
        if not robots:
            robots = [self.Robot]

        # add sequence to robots
        for robot in robots:
            if not tmp:
                robot.add_sequence(Sequence(seq_name, self.frames))

            # save to file
            robot_dir = './src/sequences/' + robot.name + '/'
            robot_dir += "tmp/" if tmp else ""

            # if sequence should go into subdirectory
            if ('/' in seq_name):
                robot_dir += seq_name[:seq_name.rfind('/')]
                seq_name = seq_name[seq_name.rfind('/'):]
            # robot_dir += seq_name[:seq_name.find('/')] if '/' in seq_name
            if not os.path.exists(robot_dir):
                os.makedirs(robot_dir)

            with open(robot_dir + seq_name + '_sequence.json', 'w') as seq_file:
                json.dump({'animation': seq_name, 'frame_list': self.frames_list}, seq_file, indent=2)

        # stop self
        self.stop()
        return self.frames_list
