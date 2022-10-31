# Blossom

Blossom is an open-hardware, open-source tensile robot that you can handcraft and accessorize to your liking. You can read more about the project in the [ACM T-HRI Paper](https://doi.org/10.1145/3310356) and in [Evan Ackerman's IEEE Spectrum article](https://spectrum.ieee.org/automaton/robotics/home-robots/blossom-a-creative-handmade-approach-to-social-robotics-from-cornell-and-google).

Here are two examples of Blossom robots:

<img src="http://guyhoffman.com/wp-content/uploads/2017/08/blossom-bunny-corner-e1502812175733-300x189.jpg" height="200"> <img src="http://guyhoffman.com/wp-content/uploads/2017/08/blossom-jellyfish-768x606.jpg" height="200" >

**For any questions (assembly or software related), [please check/make public issues](https://github.com/hrc2/blossom-public/issues).**

## How to Cite

If you use this repository or any of its content, please cite it as follows:

Michael Suguitan and Guy Hoffman. 2019. Blossom: A Handcrafted Open-Source Robot. _J. Hum.-Robot Interact. 8_, 1, Article 2 (March 2019), 27 pages. https://doi.org/10.1145/3310356


Bibtex:
```
@article{suguitan2019blossom,
author = {Suguitan, Michael and Hoffman, Guy},
title = {Blossom: A Handcrafted Open-Source Robot},
year = {2019},
issue_date = {March 2019},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
volume = {8},
number = {1},
doi = {10.1145/3310356},
journal = {J. Hum.-Robot Interact.},
month = {mar},
articleno = {2},
numpages = {27},
keywords = {craft, social robotics, toolkit, handcrafted, robot toolkit, craft robotics, 
            research platform, open-source, Robot design, soft robotics}
}
```

----

# Blossom How-To

## Get repo
In a terminal, clone this repo
```
git clone https://github.com/hrc2/blossom-public/
```

## Setup Software Dependencies

Make sure you're using [Python `3`]
To check, run `python -V` or `python3 -V`in the terminal to check the version. As of now, this codebase was tested and works on `Python 3.5.2` on Ubuntu 16.04 and Mac.
_The following steps will assume `python -V` reports with version `>3.x.x`. If it reports `2.x.x` then replace `python` in the following steps with `python3`_

Also ensure that [`pip3` is installed](https://pip.pypa.io/en/stable/installing/).
To install:\
Ubuntu: `sudo apt install python3-pip`\
Mac: `curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py`, then `python3 get-pip.py`

Virtual environments (`venv`) should be installed, but if not:\
Ubuntu: `sudo apt-get install python3-venv`\
Mac: `brew install python3-venv`

Make a `venv` (virtual environment) in the top `blossom` directory and activate it:
```
python -m venv blossom_venv
source blossom_venv/bin/activate
```

### General Setup


_Ubuntu_: You may need to run 

```
sudo apt-get install build-essential libssl-dev libffi-dev python3-dev`  
``` 
and
```
pip install wheel
```

To install dependencies, run in the main `blossom` directory:
```
pip install -r requirements.txt
```

_Mac OSX: You may need to append `--user` to the `pip` command to circumvent installation issues:_
```
pip install -r requirements.txt --user
```
_If this still doesn't work, you may have to append `sudo` before `pip`:_
```
sudo pip install -r requirements.txt --user
```
_This may require you to run in `sudo` for subsequent steps._

_It may take a while to install the dependencies; you may want to run `pip` verbose to make sure that it's still downloading: `pip install -rv requirements.txt`_

_If you run into an error opening a port, try changing Blossom's permissions: `sudo chmod 777 /dev/ttyACM0`. Alternatively, rerun everything with admin privileges._

_If you're using OSX and getting strange errors, try:_
```
sudo chown -R $USER /Library/Python/3.5
```
_Installation will take longer on a Raspberry Pi, and you may need additional dependencies:_
```
sudo apt-get install xvfb
```


## Building Blossom

To build your own Blossom, check out the [Build Guide](https://github.com/hrc2/blossom-public/wiki). The rest of this document will teach you how to set up the software to run the robot.

> **Note**
> You need to have the basic software set up as listed above to build Blossom_


## Running Blossom 

### CLI
To start the CLI, plug Blossom in and run
```
python start.py 
```
_Error: could not open port. You may need to run `sudo chmod 777 <the name of the port>.` 
Ex: `sudo chmod 777 /dev/ttyACM0`


Additional flags:
```
-b do not start up Web UI
-p denote the port
-i specify an IP address (won't work with localhost)
```
_Linux may default to a loopback IP (`127.0.1.1`); in this case you **must** specify the IP address using `-i`._

For example, to make Blossom nod with the `yes` sequence, type: 

`s` -> Enter -> `yes`

Available commands:
- `l`: list available sequences
- `s`: perform a sequence, followed by the Enter key and the sequence name
- To perform an idler (looped gesture), enter two sequence names separated by `=`, e.g. `s` -> Enter -> `yes=no` (play `yes` then loop `no` indefinitely until another sequence is played).  
- `q`: quit

## Interfaces

The startup prompt will say 
    
    +-------------------+
    |     IP ADDRESS    |
    +-------------------+
    | 10.132.3.171:8000 |
    +-------------------+

The IP address in this case is `10.132.3.171`. **Your IP address will be different from 10.132.3.171**

### GUI
The GUI _should_ be accessible via `localhost:8000` or `*IP address:8000` after starting up the CLI if `-b` was **not** specified. Otherwise, the CLI should print a message stating the server url.

### Mobile app

**Installation**

Detailed instructions are available in [BlossomApp](https://github.com/hrc2/blossom-public/tree/master/BlossomApp)

**Controlling the robot**

This allows you to control the robot's orientation (pitch, yaw, roll) by moving the phone and use sliders for the height.

Enter the IP address into the `Host` field and toggle `Control robot`. By default, the robot will copy the phone's orientation identically, i.e. the robot should be facing _away_ from you. To control the robot as it's facing you, toggle `Mirror` to be `On` and the robot will gaze at the top end of the phone (like a cat looking at a laser pointer, emitting from the top of the phone).

### Build reactions to videos

Open a new terminal and the video editor by typing: `xdg-open blossom_blockly/index.html` (Ubuntu) or `open blossom_blockly/index.html` (Mac), then hit “Enter.” The video editor should open in a new browser or tab.

Type in the IP address into the editor and press `Update IP Address`.

To update the video, paste the URL into the field and click `Update Video`.  
_Some videos have restrictions and cannot play._

**Choreograph**  
In the left side of the video editor screen, use a Gesture block and input the starting time and gesture name.  

Blocks must be connected to the initial block together for them to trigger gestures.   
You can create new gestures with the __mobile app__ and use them in the editor video with `Reload Gestures`.

Check `Loop` box to repeat the movement indefinitely until the next gesture. 

Adjust the playback speed, exaggeration (amplitude) and posture (lean forwards/backwards): 

 	-Choose and Adjustment block and add it to the gesture blocks in the "Adjustments" part  
	-Enter the multiplier in the “multiply by” block.  
	-Connect the multiplier block to the Adjustment block  
	-Only one adjustment can be used at a time.  

