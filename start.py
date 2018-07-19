"""
Start up the blossom webserver, CLI client, and web client.
"""

# make sure that prints will be supported
from __future__ import print_function

import sys
assert sys.version_info.major == 2
from builtins import input
import subprocess
import argparse
import os
import shutil
import signal
from config import RobotConfig
from src import robot
from src.server import server
from src import server as srvr
import threading
import webbrowser
import re
from serial.serialutil import SerialException
from pypot.dynamixel.controller import DxlError
import random
import time
import logging
from google.cloud import datastore
import uuid
from src import firebase_control as fc

# seed time for better randomness
random.seed(time.time())

# turn off Flask logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# using GCP to store new gestures
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./src/gcp_key.json"
datastore_client = datastore.Client()

# main robot
master_robot = None
# list of robots
robots = []
second_robot = None
# speed factor to playback sequences
speed = 1.0

# yarn process (for web/UI stuff)
yarn_process = None

# CLI prompt
prompt = "(l)ist sequences / (s)equence play / (q)uit: "

class SequenceRobot(robot.Robot):
    """
    Robot that loads, plays, and records sequences
    Extends Robot class
    """
    def __init__(self, name, config):
        # init robot
        super(SequenceRobot, self).__init__(config, 1000000, name)
        # save configuration (list of motors for PyPot)
        self.config = config
        # threads for playing and recording sequences
        self.seq_thread = self.seq_stop = None
        self.rec_thread = self.rec_stop = None
        # load all sequences for this robot
        self.load_seq()

    def load_seq(self):
        """
        Load all sequences in robot's directory
        """
        # get directory
        seq_dir = './src/sequences/%s' % self.name
        # make sure that directory for robot's seqs exist
        if not os.path.exists(seq_dir):
            os.makedirs(seq_dir)

        # iterate through sequences
        for seq in os.listdir(seq_dir):
            subseq_dir = seq_dir + '/' + seq

            # is sequence, load
            if (seq[-5:] == '.json'):
                self.load_sequence(subseq_dir)

            # is subdirectory, go in and load all sequences
            # skips subdirectory if name is 'ignore'
            elif os.path.isdir(subseq_dir) and not ('ignore' in subseq_dir):
                # go through all sequence
                for s in os.listdir(subseq_dir):
                    # is sequence, load
                    if (s[-5:] == '.json'):
                        self.load_sequence(subseq_dir + '/' + s)


    def assign_time_length(self, keys, vals):
        timeMap = [None] * len(keys)
        for i in range(0, len(keys)):
            frameLst = vals[i].frames
            timeAmnt = frameLst[len(vals[i].frames) - 1].millis
            timeMap[i] = [keys[i], str(timeAmnt / 1000)]
        return timeMap

    def get_time_sequences(self):
        tempKeys = self.seq_list.keys()
        tempVals = self.seq_list.values()
        tempMap = self.assign_time_length(tempKeys, tempVals)
        return tempMap
        
    def get_sequences(self):
        """
        Get all sequences loaded on robot
        """
        return self.seq_list.keys()


    def play_recording(self, seq, idler=False):
        """
        Play a recorded sequence
        args:
            seq     sequence name
            idler   whether to loop sequence or not
        returns:
            the thread setting motor position in the sequence
        """
        # create stop flag object
        self.seq_stop = threading.Event()

        # loop if idler
        if ('idle' in seq):
            seq = seq.replace('idle', '').replace(' ', '').replace('/', '')
            idler = True

        # start playback thread
        self.seq_thread = robot.sequence.SequencePrimitive(
            self, self.seq_list[seq], self.seq_stop, idler=idler, speed=speed)
        self.seq_thread.start()

        # return thread
        return self.seq_thread


    def start_recording(self):
        """
        Begin recording a sequence
        """
        # create stop flag object
        self.rec_stop = threading.Event()

        # start recording thread
        self.rec_thread = robot.sequence.RecorderPrimitive(self, self.rec_stop)
        self.rec_thread.start()

   
    def calibrate(self):
        """
        Calibrate the resting height of the robot
        """
        # make compliant
        self.set_compliant(True)

        # allow user to move motors
        # prompt when done
        input("Move motors to desired calibration position")

        # get current positions
        motor_pos = self.get_motor_pos()

        # edit config
        # calib_config = getattr(self.config, self.name)
        calib_config = RobotConfig().get_configs(self.name)
        for m, p in motor_pos.iteritems():
            calib_config['motors'][m]['offset'] = p - 100
        #
        print(calib_config)
        # reopen/overwrite
        self.robot.close()
        self.reconfig(calib_config)
        self.load_seq()

        # TODO: save calibrated config


'''
CLI Code
'''

def start_cli(robot):
    """
    Start CLI as a thread
    """
    t = threading.Thread(target=run_cli, args=[master_robot])
    t.daemon = True
    t.start()


def run_cli(robot):
    """
    Handle CLI inputs indefinitely
    """
    while(1):
        # get command string
        cmd_str = input(prompt)
        cmd_string = re.split('/| ', cmd_str)
        cmd = cmd_string[0]

        # parse to get argument
        args = None
        if (len(cmd_string) > 1):
            args = cmd_string[1:]

        # handle the command and arguments
        handle_input(master_robot, cmd, args)

def handle_quit():
    """
    Close the robot object and clean up any temporary files. Manually kill the flask server because there isn't an obvious way to do so gracefully.

    Raises:
        ???: Occurs when yarn failed to start but yarn_process was still set to true.
    """
    print("Exiting...")
    for bot in robots:
        # clean up tmp dirs and close robots
        tmp_dir = './src/sequences/%s/tmp' % bot.name
        if os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)
        bot.robot.close()
    print("Bye!")
    # TODO: Figure out how to kill flask gracefully
    if yarn_process:
        try:
            os.killpg(os.getpgid(yarn_process.pid), signal.SIGTERM)
        except Exception:
            print("Caught unknown exception (please change the except statement)")
            print("Couldn't kill yarn process")
            pass
    os.kill(os.getpid(), signal.SIGTERM)


def handle_input(robot, cmd, args=[]):
    """
    handle CLI input

    Args:
        robot: the robot affected by the given command
        cmd: a robot command
        args: additional args for the command
    """
    # manipulate the global speed var
    global speed

    # separator between sequence and idler
    idle_sep = '='
    # play sequence
    if cmd == 's':
        # default to not idling
        # idler = False
        # get sequence if not given
        if not args:
            args = ['']
            # args[0] = raw_input('Sequence: ')
            seq = input('Sequence: ')
        else:
            seq = args[0]
        # check if should be idler
        # elif (args[0] == 'idle'):
        #     args[0] = args[1]
        #     idler = True
        idle_seq = ''
        if (idle_sep in seq):
            (seq, idle_seq) = re.split(idle_sep + '| ', seq)

        # catch hardcoded idle sequences
        if(seq == 'random'):
            random.seed(time.time())
            seq = random.choice(['calm', 'slowlook', 'sideside'])
        if(idle_seq == 'random'):
            random.seed(time.time())
            idle_seq = random.choice(['calm', 'slowlook', 'sideside'])
        if (seq == 'calm' or seq == 'slowlook' or seq == 'sideside'):
            idle_seq = seq

        # play the sequence if it exists
        if seq in robot.seq_list:
            # iterate through all robots
            for bot in robots:
                if not bot.seq_stop:
                    bot.seq_stop = threading.Event()
                bot.seq_stop.set()
                seq_thread = bot.play_recording(seq, idler=False)
            # go into idler
            if (idle_seq != ''):
                while (seq_thread.is_alive()):
                    continue
                for bot in robots:
                    if not bot.seq_stop:
                        bot.seq_stop = threading.Event()
                    bot.seq_stop.set()
                    bot.play_recording(idle_seq, idler=True)
        # sequence not found
        else:
            print("Unknown sequence name!")
            return

    # record sequence
    elif cmd == 'r':
        record(robot)
        input("Press 'enter' to stop recording")
        stop_record(robot, input("Seq name: "))

    # list and print sequences (only for the first attached robot)
    elif cmd == 'l':
        for i in robot.seq_list.keys():
            print(i)

    # exit
    elif cmd == 'q':
        handle_quit()

    # debugging stuff
    # manually move
    elif cmd == 'm':
        # get motor and pos if not given
        if not args:
            args = ['', '']
            args[0] = input('Motor: ')
            args[1] = input('Position: ')
        for bot in robots:
            if (args[0] == 'all'):
                bot.goto_position({'tower_1': float(args[1]), 'tower_2': float(
                    args[1]), 'tower_3': float(args[1])}, 0, True)
            else:
                bot.goto_position({args[0]: float(args[1])}, 0, True)

    # adjust speed
    elif cmd =='e':
        speed = float(raw_input('Speed factor: '))

    # help
    elif cmd == 'h':
        exec('help(' + input('Help: ') + ')')

    # manual control
    elif cmd == 'man':
        while True:
            try:
                exec(input('Command: '))
            except KeyboardInterrupt:
                break

    # elif cmd == 'c':
    #     robot.calibrate()

    else:
        print("Invalid input")


def record(robot):
    """
    Start new recording session on the robot
    """
    # reset robot's position
    robot.reset_position()
    # stop recording if one is happening
    if not robot.rec_stop:
        robot.rec_stop = threading.Event()
    # start recording thread
    robot.rec_stop.set()
    robot.start_recording()


def stop_record(robot, seq_name=""):
    """
    Stop recording
    args:
        robot       the robot under which to save the sequence
        seq_name    the name of the sequence
    returns:
        the name of the saved sequence
    """
    # stop recording
    robot.rec_stop.set()

    # if provided, save sequence name
    if seq_name:
        seq = robot.rec_thread.save_rec(seq_name, robots=robots)
        store_gesture(seq_name, seq)
    # otherwise, give it ranodm remporary name
    else:
        seq_name = uuid.uuid4().hex
        robot.rec_thread.save_rec(seq_name, robots=robots, tmp=True)

    # return name of saved sequence
    return seq_name


def store_gesture(name, sequence, label=""):
    """
    Save a sequence to GCP datastore
    args:
        name: the name of the sequence
        sequence: the sequence dict
        label: a label for the sequence
    """
    if datastore_client:
        key = datastore_client.key("Gesture")
        gesture = datastore.Entity(key=key)
        gesture["sequence"] = sequence
        gesture["label"] = label
        gesture["name"] = name
        datastore_client.put(gesture)


'''
Main Code
'''

def start_server(host, port, hide_browser):
    """
    Initialize the blossom webserver and open the web client.

    Args:
        host: the hostname of the server socket
        port: the port of the server socket
        hide_browser: does not open the web client if set to true
    """
    global yarn_process

    print("Starting server on %s:%d" % (host, port))
    start_yarn()
    if not hide_browser:
        addr = "%s:%d" % (host, port)
        webbrowser.open("http://%s" % addr, new=2)
    print("\nExample command: s -> *enter* -> yes -> *enter*")
    print(prompt)
    server.set_funcs(master_robot, robots, handle_input,
                     record, stop_record, store_gesture)
    server.start_server(host, port)


def start_yarn():
    """
    Run `yarn dev` to start the react app. The process id is saved to a global variable so it can be killed later.
    """
    global yarn_process

    command = "yarn dev"
    print(command)
    yarn_process = subprocess.Popen(
        command, shell=True, cwd="./blossom_web", stdout=subprocess.PIPE, preexec_fn=os.setsid)


def main(args):
    """
    Start robots, start up server, handle CLI
    """
    # get robots to start
    global master_robot
    global robots

    # print all robots to connect
    if args.list_robots:
        for name in RobotConfig().get_names():
            print(name)
        return

    # use first name as master
    configs = RobotConfig().get_configs(args.names)
    master_robot = safe_init_robot(args.names[0], configs[args.names[0]])
    configs.pop(args.names[0])
    # start robots
    robots = [safe_init_robot(name, config)
              for name, config in configs.items()]
    robots.append(master_robot)

    master_robot.reset_position()

    # put ip address of machine in firebase
    fc.fb_put(args.names[0],'ip',args.host)

    # start CLI
    start_cli(master_robot)
    # start server
    start_server(args.host, args.port, args.browser_disable)


def safe_init_robot(name, config):
    """
    Safely start/init robots, due to sometimes failing to start motors
    args:
        name    name of the robot to start
        config  the motor configuration of the robot
    returns:
        the started SequenceRobot object
    """
    # SequenceRobot
    bot = None
    # limit of number of attempts
    attempts = 10

    # keep trying until number of attempts reached
    while bot is None:
        try:
            bot = SequenceRobot(name, config)
        except (DxlError, NotImplementedError, RuntimeError, SerialException) as e:
            if attempts <= 0:
                raise e
            print(e, "retrying...")
            attempts -= 1
    return bot


def parse_args(args):
    """
    Parse arguments from starting in terminal
    args:
        args    the arguments from terminal
    returns:
        parsed arguments
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--names', '-n', type=str, nargs='+',
                        help='Name of the robot.', default=["blossom"])
    parser.add_argument('--port', '-p', type=int,
                        help='Port to start server on.', default=8000)
    parser.add_argument('--host', '-i', type=str, help='IP address of webserver',
                        default=srvr.get_ip_address())
    parser.add_argument('--browser-disable', '-b',
                        help='prevent a browser window from opening with the blossom UI', action='store_true')
    parser.add_argument('--list-robots', '-l',
                        help='list all robot names', action='store_true')
    return parser.parse_args(args)

"""
Generic main handler
"""
if __name__ == "__main__":
    main(parse_args(sys.argv[1:]))
