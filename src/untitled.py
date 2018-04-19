
class RecorderPrimitive(pypot.primitive.Primitive):

    frames = []
    # only cares about the believed motor positions
    motor_pos = []


    def __init__(self, robot, rec, rec_stop):
        self.Robot = robot
        self.robot = robot.robot
        self.update = self.record
        self.motor_pos = self.robot.believed_motor_pos
        # how many motors to record
        self.num_motors = len(self.believed_motor_pos)

        pypot.primitive.Primitive.__init__(self, robot.robot)

    def run(self):
        # add frame to frames
        self.robot.set_compliant(False)

        # get time
        millis = int(self.elapsed_time()*1000)

        # get positions
        # self.motor_pos = self.robot.believed_motor_pos

        # create frame
        f = sequence.Frame(millis, self.robot.believed_motor_pos)

        # add frame to frames
        frames.append(f)

    def stop(self):
        # save frames as new sequence
        seq_name = raw_input("Sequence name: ")
        seq = sequence.Sequence(seq_name, frames)

        # stop as if normal primitive
        self.stop()