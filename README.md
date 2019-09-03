# Blossom

Blossom is an open-hardware, open-source tensile robot that you can handcraft and accessorize to your liking. You can read more about the project in [Evan Ackerman's IEEE Spectrum article](https://spectrum.ieee.org/automaton/robotics/home-robots/blossom-a-creative-handmade-approach-to-social-robotics-from-cornell-and-google).

Here are two examples of Blossom robots:

<img src="http://guyhoffman.com/wp-content/uploads/2017/08/blossom-bunny-corner-e1502812175733-300x189.jpg" width="300">
<img src="http://guyhoffman.com/wp-content/uploads/2017/08/blossom-jellyfish-768x606.jpg" width="300" >

**For any questions (assembly or software related), [please check/make public issues](https://github.com/hrc2/blossom-public/issues).**

## Get repo
In a terminal, clone this repo
```
git clone https://github.com/hrc2/blossom-public/
```
_Download through a package will be added in the future._

## Setup Software Dependencies

Make sure you're using [Python `3`]
To check, run `python3 -V`or `python -V` in the terminal to check the version. As of now, the code works on `Python 3.5.2`.

Also ensure that [`pip3` is installed](https://pip.pypa.io/en/stable/installing/).
To install:
Linux: `sudo apt install python3-pip`
Mac: `curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py`, then `python3 get-pip.py`

Virtual environments (`venv`) should be installed, but if not:
Linux: `sudo apt-get install python3-venv`
Mac: `brew install python3-venv`

Make a `venv` (virtual environment) in the top `blossom` directory and activate it:
```
python3 -m venv blossom_venv
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
sudo chown -R $USER /Library/Python/2.7
```
_Installation will take longer on a Raspberry Pi, and you may need additional dependencies:_
```
sudo apt-get install xvfb
```


## Building Blossom

To build your own Blossom, check out the [Build Guide](https://github.com/hrc2/blossom-public/wiki). The rest of this document will teach you how to set up the software to run the robot.

_Note that you need to have the basic software set up to correctly build Blossom_

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
-b do not start up web ui
-p denote the port
-i specify an IP address (won't work with localhost)
```
_Linux may default to a loopback IP (`127.0.1.1`); in this case you **must** specify the IP address using `-i`._

To make Woody nod, type: 

`s` -> Enter -> `yes`

Available commands:
- `l`: list available sequences
- `s`: perform a sequence, followed by the Enter key and the sequence name
- To perform an idler (looped gesture), enter two sequence names separated by `=`, e.g. `s` -> Enter -> `yes=no` (play `yes` then loop `no` indefinitely until another sequence is played).  
- `q`: quit

### GUI
The GUI _should_ be accessible via `localhost:8000` after starting up the CLI if `-b` was **not** specified. Otherwise, the CLI should print a message stating the server url.

### Built reactions to videos

Open a new terminal and the video editor by typing: `xdg-open blossom_blockly/index.html` , then hit “Enter.” The video editor should open.

In the video editor, type in the video URL with the video that your group chose and click “Update Video”.  
_-Make sure that the video works (some videos have restrictions and cannot play)._

In the terminal, startup the robot by typing: `python start.py -b`, then hit “Enter.”

The startup prompt will say 
	
	+-------------------+
	|     IP ADDRESS    |
	+-------------------+
	| 10.132.3.171:8000 |
	+-------------------+

This means that the IP address is 10.132.3.171. **Your IP address might not be 10.132.3.171**


Type in the IP address from the previous step into the editor and press “Update IP Address”.

**Choreograph**  
In the left side of the video editor screen, use a Gesture block and input the starting time and gesture name.  

Blocks must be connected to the initial block together for them to trigger gestures.   
You can create new gestures with the __mobile app__ and use them in the editor video by hitting "Reload Gestures"  

Check “Loop” to repeat the movement indefinitely until the next triggered gesture. 

Adjust the playback speed, exaggeration (amplitude) and posture (lean forwards/backwards):  

 	-Choose and Adjustment block and add it to the gesture blocks in the "Adjustments" part  
	-Enter the multiplier in the “multiply by” block.  
	-Connect the multiplier block to the Adjustment block  
	-Only one adjustment can be used at a time.  

### Mobile app (Currently only supported for Android)

**Installation**

The app can be installed on [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) via the Expo Client app. Then, find the last stable release by searching for `https://exp.host/@hrc2/blossom-app`.

**Controlling the robot**

In the app, tap the `Settings` icon in the top right.

Enter the IP address of the host computer; this is listed under "IP ADDRESS: *IP_address*:8000" when first starting `start.py` or can be found other ways.

Once the IP address is entered, go back to the controller and toggle on `Control Robot`.

This allows you to control the robot's orientation (pitch, yaw, roll) by moving the phone and use sliders for the height.

_If Blossom is not controllable at first, unfocus and refocus the app._

