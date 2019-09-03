"""
A Flask webserver for handling requests to the robot
"""
from __future__ import print_function

import os
from . import kinematics as k
from flask import Flask, render_template, request, jsonify
import json
import numpy as np
from collections import OrderedDict
import socket
import requests
from flask_cors import CORS

class Server(object):
    """
    A "singleton" object for housing server state. Includes methods for updating server functions from outside sources.
    """

    def __init__(self):
        self.master_robot = None
        self.robots = []
        self.handle_input = lambda: None
        self.record = lambda: None
        self.stop_record = lambda: None
        self.store_gesture = lambda: None

        # playback params
        self.speed = 1.0
        self.amp = 1.0
        self.post = 1.0

        # init yaw (for resetting w/ phone controller)
        self.yaw = 0
        # init dict of current motor positions
        self.motor_pos = {}

    def set_funcs(self, master_robot, robots, handle_input, record, stop_record, store_gesture):
        """
        updates server functions
        """
        self.master_robot = master_robot
        self.robots = robots
        self.handle_input = handle_input
        self.record = record
        self.stop_record = stop_record
        self.store_gesture = store_gesture

    def start_server(self, host, port):
        """
        initialize the flask server
        """
        app.run(host=host, port=port, threaded=True)


app = Flask(__name__) 
CORS(app)
server = Server()
cur_yaw = 0

# paths relative to start.py, should make relative to this file in the future
SEQUENCES_DIR = "./src/sequences/"
REACTIONS_DIR = "./src/reactions/"


@app.after_request
def add_cors_headers(response):
    """
    adds cors headers
    """
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Headers', 'Cache-Control')
    response.headers.add(
        'Access-Control-Allow-Headers', 'X-Requested-With')
    response.headers.add('Access-Control-Allow-Headers', 'Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                         'GET, POST, OPTIONS, PUT, DELETE')
    return response


@app.route('/r')
def handle_reload():
    """
    reload list of sequences
    """
    server.handle_input(server.master_robot, 'r')
    return "reloaded"


@app.route('/s/<gesture>')
def handle_sequence(gesture):
    """
    plays a sequence
    """
    speed, amp, post = request.args.get('speed'), request.args.get('amp'), request.args.get('post')

    if speed==None: speed = 1
    if amp==None: amp = 1
    if post==None: post = 1

    server.speed = float(speed)
    server.amp = float(amp)
    server.post = float(post)

    for bot in server.robots:
        bot.speed = server.speed
        bot.amp = server.amp
        bot.post = server.post

    server.handle_input(server.master_robot, 's', [gesture])
    return gesture, "fired"


@app.route('/s/<gesture>/<idle>')
def handle_sequence_idle(gesture, idle):
    """
    plays a sequence, repeating indefinitely
    """
    try:
        server.handle_input(server.master_robot, 's', [gesture + '/' + idle])
    except KeyError as e:
        print("Unknown sequence", e)
        pass
    return gesture, "fired"


@app.route('/position', methods=['POST'])
def set_position():
    """
    moves the robot to the positon specified by the request data
    """
    # get data as string
    # data is provided as rotations wrt y,-x,-z (w/ screen facing up)
    # order is pitch/y, (-)roll/(-)x, -yaw(-z), height, ears, acc_x, acc_y, acc_z
    # split into measurements
    raw_data = request.get_json()
    imu = get_imu_data(raw_data)
    mirror = raw_data['mirror']

    global server
    # get base motor positions, accounting for stored yaw reset position
    adj_yaw = imu[2]-server.yaw
    pos = k.get_motor_pos(
        [-adj_yaw, imu[0], -imu[1], imu[3]], [imu[4], imu[5], imu[6]])
    # get ear motor position
    ears_pos = k.get_ears_pos(imu[4])
    # save orientation
    ori = [-imu[2], imu[0], -imu[1]]

    # filter out readings below certain threshold
    accel = [imu[4], imu[5], imu[6]]

    k.integrate_accel(ori, accel)

    # command positions
    motor_pos = {
        'tower_1': pos[0],
        'tower_2': pos[1],
        'tower_3': pos[2],
        'base': pos[3],
        'ears': ears_pos
    }

    # handle mirroring mode (swap roll for towers 2 and 3, flip yaw)
    if (mirror):
        # motor_pos['tower_1']= pos[0]
        motor_pos['tower_2'] = pos[2]
        motor_pos['tower_3'] = pos[1]
        motor_pos['base'] = -pos[3]

    # prevent quick turning around
    if 'base' in server.motor_pos:
        last_yaw = server.motor_pos['base']
        if(np.abs(last_yaw - motor_pos['base']) > 100):
            motor_pos['base'] = last_yaw

    # adjust the duration (numeric input to goto_position)
    # higher (0.3) = slow+smooth, low (0.1) = jittery+fast
    for bot in server.robots:
        # print(motor_pos)
        bot.goto_position(motor_pos, 0.1, True)
        bot.believed_motor_pos = motor_pos

    server.motor_pos = motor_pos
    return "200 OK"


def get_imu_data(raw_data):
    """
    return the current imu values of the robot
    """
    global cur_yaw

    # convert to floats
    imu = [raw_data['x'], raw_data['y'], raw_data['z'],
           raw_data['h'], raw_data['ears'],
           raw_data['ax'], raw_data['ay'], raw_data['az']]

    cur_yaw = imu[2]
    return imu


@app.route('/sequences')
def get_sequences():
    
    seqs = server.master_robot.get_time_sequences()

    return jsonify(seqs)


# TODO: support multiple robots and move logic to start.py (in case we want to update from CLI)
@app.route('/sequences/<seq_id>', methods=['POST'])
def update_sequence(seq_id):
    """
    Updates a sequence's name. If the sequence was temporary before, make it a persistant sequence.
    """
    # load the data from the gesture generation form
    data = json.loads(request.data)
    if "name" not in data:
        return "no name given", 400
    # split
    name, label = data["name"], data["label"]

    # directory stuff
    seq_dir = "%s%s/" % (SEQUENCES_DIR, server.master_robot.name)
    tmp_dir = seq_dir + "tmp/"
    # if should belong in subdirectory, make directory and truncate sequence name
    if ('/' in name):
        seq_dir += name[:name.rfind('/') + 1]
        if not os.path.isdir(seq_dir):
            os.makedirs(seq_dir)
        name = name[name.find('/') + 1:]

    # handle collisions with existing gesture names
    new_name = name
    name_ctr = 1
    while ((new_name + '_sequence.json') in os.listdir(seq_dir)):
        new_name = name + '_' + str(name_ctr)
        name_ctr += 1
    name = new_name

    # temporary file
    src_file = "%s_sequence.json" % seq_id
    # actual file
    dst_file = "%s_sequence.json" % name

    # move from temporary to actual
    for seq in os.listdir(tmp_dir):
        if seq == src_file:
            os.rename(tmp_dir + src_file, seq_dir + dst_file)
            update_seq_file(seq_dir + dst_file, name, label)
            return "200 OK"

    # change name in actual
    for seq in os.listdir(seq_dir):
        if seq == src_file:
            os.rename(seq_dir + src_file, seq_dir + dst_file)
            update_seq_file(seq_dir + dst_file, name, label)
            return "200 OK"
    return "sequence not found", 404


def update_seq_file(seq_path, name, label):
    """
    updates the content of a sequence file to the given args.
    """
    seq = json.load(open(seq_path))

    seq["animation"] = name
    seq["label"] = label
    with open(seq_path, "w") as f:
        json.dump(seq, f, indent=2)

    for robot in server.robots:
        robot.load_sequence(seq_path)
    server.store_gesture(name, seq["frame_list"], label)

@app.route('/videos')
def get_videos():
    """
    return a list of videos we have sequences for
    """
    # init dict of all video ids
    video_ids = OrderedDict()
    app.config["JSON_SORT_KEYS"] = False

    # get path to directory storing reactions
    video_dir = REACTIONS_DIR
    if not os.path.exists(video_dir):
        os.makedirs(video_dir)

    # save all videos
    for vid in os.listdir(video_dir):
        # check if json
        if (vid[-5:] == '.json'):
            # load file
            data = json.load(open(video_dir + vid))
            # catch if video was already added
            video_id = data["videoId"]
            video_ids.update({video_id: data["triggers"]})
    return jsonify(video_ids)


@app.route('/reset', methods=['POST'])
def reset_sensors():
    """
    move blossom to the yaw = 0 position
    """
    # reset robot position
    global server
    server.master_robot.reset_position()
    server.motor_pos = server.master_robot.reset_pos
    # get current yaw reading and store it
    server.yaw = cur_yaw
    return "200 OK"


@app.route('/record/start', methods=['POST'])
def handle_record_start():
    server.record(server.master_robot)
    return "200 OK"


@app.route('/record/stop', methods=['POST'])
def handle_record_stop():
    name = server.stop_record(server.master_robot)
    return jsonify({"name": name})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def render_gui(path):
    """
    catch all that renders the react app
    """
    return render_template('index.html')


# get the current ip address of the computer
def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    return s.getsockname()[0]
