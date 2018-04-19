class Motor:
    id = 0
    pos = 0
    pos_offset = 0
    speed = 0
    def_speed = 100

    # TODO: check that motor connects
    # TODO: check that motor is not already connected
    def __init__(self, id, m):
        self.id = id
        self.m = m
        self.pos = self.get_pos()
        self.speed = self.get_speed()
        self.pos_offset = 0

    def move(self, pos, speed=None, acc=None):
        self.pos = pos

        # set moving speed
        if speed:
            self.m.set_moving_speed({self.id: speed})
        # otherwise set to max speed
        else:
            self.m.set_moving_speed({self.id: self.def_speed})

        # move to position, counting for offset
        self.m.set_goal_position({self.id: (self.pos + self.pos_offset)})

    # def move_time(self,pos,duration=0):
    #     self.pos =

    # convert angles to degrees
    def move_angle(self, angle, speed=None, acc=None):
        pos = (angle - 3) * 50
        self.move(pos, speed, acc)

    # set current position as '0'
    def calibrate(self):
        self.pos_offset = self.pos
        self.pos = 0

    def reset_calibration(self):
        self.pos_offset = 0
        self.move_to(0)
        self.pos = self.m.get_present_position({self.id})[0]

    def get_pos(self):
        self.pos = self.m.get_present_position({self.id})[0]

    def get_speed(self):
        self.speed = self.m.get_moving_speed({self.id})[0]
