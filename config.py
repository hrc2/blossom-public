"""
Module to help differentiate between robots with different motor configurations.
"""
from __future__ import print_function

import pypot.dynamixel as pd
from serial.serialutil import SerialException
import sys


class RobotConfig(object):
    """
    Repo for PyPot configurations for robots
    Configs defined as controllers, motorgroups, and motors
    """

    def __init__(self):
        self.ports = pd.get_available_ports()
        # catch no available ports
        if (len(self.ports) == 0):
            self.ports = ['']
        self.configs = {
            'woody': {
                'controllers': {
                    'my_dxl_controller': {
                        'sync_read': False,
                        'attached_motors': ['tower', 'bases', 'head'],
                        'port': 'auto',
                        'baudrate': 1000000,
                        'protocol': 2
                    }
                },
                'motorgroups': {
                    'tower': ['tower_1', 'tower_2', 'tower_3'],
                    'bases': ['base'],
                    'head': ['ears']
                },
                'motors': {
                    'tower_1': {
                        'orientation': 'direct',
                        'type': 'XL-320',
                        'id': 1,
                        'angle_limit': [-150.0, 150.0],
                        'offset': 0.0
                    },
                    'tower_2': {
                        'orientation': 'direct',
                        'type': 'XL-320',
                        'id': 2,
                        'angle_limit': [-150.0, 150.0],
                        'offset': 0.0
                    },
                    'tower_3': {
                        'orientation': 'direct',
                        'type': 'XL-320',
                        'id': 3,
                        'angle_limit': [-150.0, 150.0],
                        'offset': 0.0
                    },
                    'base': {
                        'orientation': 'direct',
                        'type': 'XL-320',
                        'id': 4,
                        'angle_limit': [-150.0, 150.0],
                        'offset': 0.0
                    },
                    'ears': {
                        'orientation': 'direct',
                        'type': 'XL-320',
                        'id': 5,
                        'angle_limit': [50, 130.0],
                        'offset': 0.0
                    },
                }
            },
            'test': {
                'controllers': {
                },
                'motorgroups': {
                },
                'motors': {
                }
            }
        }

    def get_names(self):
        """
        return a list of robot names associated with configurations
        """
        return self.configs.keys()

    def get_configs(self, names):
        """
        assign unique ports to a list of names for as many ports as we have available
        """
        # test config for debugging without a robot
        if (names[0] == 'test'):
            return {names[0]: self.configs[names[0]]}

        # get configs for all robots
        configs = []
        for name in names:
            if name in self.configs:
                configs.append((name, self.configs[name]))
        # print(configs)

        # get IDs for connected motors
        used_configs = []
        for port in self.ports:
            if port == "":
                print("No ports available")
                sys.exit(1)
            try:
                if (names[0]!='blossom' and names[0]!='vyo'):
                    dxl_io = pd.Dxl320IO(port)
                else:
                    if (names[0]=='vyo'):
                        dxl_io = pd.DxlIO(port,57600)
                    else:
                        dxl_io = pd.DxlIO(port)
                scanned_ids = dxl_io.scan(range(20))
            # handle unopenable serial port
            except SerialException as e:
                print(e)
                print("Error opening port, try:")
                print("sudo chmod 777 " + port)
                sys.exit(1)
            # general exception
            except Exception as e:
                print("general exception caught (please update the except statement with the exception)", e)
                scanned_ids = []

            # print found motors
            if (len(scanned_ids)==0):
                print("No motors found on %s" % port)
                continue
            else:
                print("Motors for %s:" % port, scanned_ids)

            # iterate through all robot configs
            for i in range(len(configs)):
                name, config = configs[i]

                # MH: scanning doesn't seem to work for the usb hub. Doing this for now since we don't use multiple bots, but if we ever do...valid_port_for_robot probably won't work
                valid_port = (len(names) == 1 or self.valid_port_for_robot(
                    scanned_ids, config))

                # remove missing motors
                config = self.return_valid_motors(scanned_ids, config)

                # iterate through all configs
                if configs[i] not in used_configs and valid_port:
                    controller = list(config['controllers'].keys())[0]
                    config['controllers'][controller]['port'] = port
                    used_configs.append(configs[i]) 
                    break
            else:
                print("No robot found for port", port)

        return {n: c for n, c in used_configs}

    def valid_port_for_robot(self, scanned_ids, config):
        """
        returns true if the number of motors discovered on a port match the number of motors in the given robot config

        Args:
            scanned_ids: a list of motor ids discovered on a port
            config: the robot config
        """
        motor_ids = [v["id"] for k, v in config["motors"].items()]
        return len(scanned_ids) == len(motor_ids)

    def return_valid_motors(self, scanned_ids, config):
        """
        modify the robot config to handle cases where motors can't be found.

        Args:
            scanned_ids: a list of motor ids discovered on a port
            config: the robot config
        """
        # get lists from
        motor_list = config['motors']
        motor_groups = config['motorgroups']

        missing_motors = []
        # iterate through all motors
        for m in motor_list:
            # if motor ID is not in list of scanned IDs, mark it for removal
            if not (motor_list[m]['id'] in scanned_ids):
                print("Couldn't find motor %s: " % motor_list[m]['id'], m)
                missing_motors.append(m)

        # remove missing motors
        for m in missing_motors:
            del(motor_list[m])

            # must also remove motors from any motorgroups that they belong in
            for mg in motor_groups:
                # get motor names in this group
                mg_values = motor_groups[mg]
                # if motor is in motor group, delete
                if m in mg_values:
                    mg_values.remove(m)

        # return new config
        return config
