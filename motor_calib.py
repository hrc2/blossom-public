import pypot.dynamixel as pd
import time

# get ports and start connection to motors
ports = pd.get_available_ports()
motors = pd.Dxl320IO(ports[0],1000000)

motor_id = motors.scan(range(20))

# only work with one motor at a time
if (len(motor_id)>1):
    print("Only connect one motor at a time!")
    quit()

if (len(motor_id)<1):
	print("No connected motors found! Did you remember to connect external power?")
	quit()
	
motor_id = motor_id[0]

print("Motor "+str(motor_id)+" found!")

new_id_str = input("Enter motor ID (1-3 for towers, 4 for base, 5+ for etc). Press enter to leave the ID as is: ")

if new_id_str != '':
    new_id = int(new_id_str)
    motors.disable_torque([motor_id])
    print("Changing motor ID changed from "+str(motor_id)+" to "+str(new_id))
    motors.change_id({motor_id:new_id})
    time.sleep(0.2)

    if (motors.ping(new_id) == True):
        motor_id = new_id
    else:
        print("Sorry, didn't work. Unplug and replug the motor and run again.")

# set motor to 100
motors.set_goal_position({motor_id:100})
input("Motor position: 100; Attach horn then press 'Enter'. ")

# set motor to 0
motors.set_goal_position({motor_id:0})
input("Motor position: 0; Calibrate string length then press 'Enter'. ")

# set motor back to 100
motors.set_goal_position({motor_id:100})
print("Motor position: 100; Calibration complete!")

quit()
