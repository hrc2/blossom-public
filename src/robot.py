import pypot.robot
from . import sequence
import collections

# define the robot
class Robot(object):
    """
    Robot wrapper object around PyPot's robot
    Extends functionality to handle sequences
    """
    # initialize robot
    def __init__(self, config, baudrate=57600, name=''):
        # init list of motors
        self.motors = {}
        # init list of sequences
        self.seq_list = collections.OrderedDict()
        # set motors to go limp
        self.compliant = True
        # name of robot
        self.name = name
        # create PyPot robot
        self.robot = pypot.robot.from_config(config)
        # ensure max power available
        self.robot.power_up()
        # add motors to dict
        for m in self.robot.motors:
            self.motors.update({m.name: m})
        # stiffen (compliant=False) joints
        self.set_compliant(False)
        # set current position as the reset position
        self.reset_pos = self.get_motor_pos()

        # reset to resting position
        self.reset_pos = {
                            'tower_1':50,
                            'tower_2':50,
                            'tower_3':50,
                            'base':0,
                            'ears':100
                        }

        self.range_pos = {
                            'tower_1':(-40,140),
                            'tower_2':(-40,140),
                            'tower_3':(-40,140),
                            'base':(-140,140),
                            'ears':(0,140)
                        }

        # init robot's believed position
        self.believed_motor_pos = self.reset_pos
        self.reset_position()

    def goto_position(self, motor_pos, delay=100, wait=True):
        """
        Wrapper for PyPot.Robot.goto_position
        args:
            motor_pos   {motor_name:position} dict of goal positions
            delay       how long to allow motors to reach position (millis)
            wait        wait for the motors to reach goal before new cmd
        """
        # activate motors
        if(self.compliant):
            self.set_compliant(False)

        # try going to position
        try:
            self.robot.goto_position(motor_pos, duration=delay, wait=wait)
        # motor doesn't exist or otherwise not able to move
        # TODO: handle this better
        except AttributeError:
            # print("Could not move: " + str(motor_pos))
            pass

    def get_motor_pos(self):
        """
        Get current motor positions
        returns:
            {motor_name:position} dict of current motor positions
        """
        motor_pos = {}
        # go through all motors
        for name, m in list(self.motors.items()):
            motor_pos.update({name: m.present_position})
        return motor_pos

    def reset_position(self):
        """
        reset motors to resting position
        """
        self.goto_position(self.reset_pos, 0)

    def reconfig(self, config):
        """
        reconfigure robot by creating new PyPot Robot
        """
        self.robot.close()
        self.robot = pypot.robot.from_config(config)

    def set_compliant(self, compliant=True):
        """
        (De)Activate motors by setting compliance
        args:
            compliant   whether motor is deactivated (true) or activated (false)
        """
        for key, m in list(self.motors.items()):
            m.compliant = compliant
        self.compliant = compliant

    def load_sequence(self, seq_fn, rad=True, force=True):
        """
        Load sequence from json file
        args:
            seq_fn  filename for sequence json
            rad     whether source is in radians
        """
        seq = sequence.Sequence.from_json(seq_fn, rad)

        # don't add if sequence name already exists
        if (seq.seq_name in self.seq_list.keys() and not force):
            return
        else:
            self.add_sequence(seq)

    def add_sequence(self, seq):
        """
        Add a sequence to the robot
        args:
            seq     the Sequence object to add
        """
        # add sequence
        seq_name = seq.seq_name
        name_ctr = 1
        # while (seq_name in self.seq_list):
        #     seq_name = seq.seq_name+'_'+str(name_ctr)
        #     name_ctr+=1
        self.seq_list.update({seq_name: seq})
        # ensure that the list stays in sorted alphabetical order
        self.seq_list = collections.OrderedDict([(s,self.seq_list[s]) for s in sorted(self.seq_list.keys())])
