import pypot.dynamixel as pd

# get ports and start connection to motors
ports = pd.get_available_ports()
motors = pd.Dxl320IO(ports[0],1000000)

motor_id = motors.scan(range(20))

# only work with one motor at a time
if (len(motor_id)>1):
    print("Only connect one motor at a time!")
    quit()
motor_id = motor_id[0]

print("Motor "+str(motor_id)+" found!")

# change ID
new_id = int(input("Enter motor ID (5 for ear): "))
if (new_id != motor_id):
    motors.change_id({motor_id:new_id})
    print("Motor ID changed from "+str(motor_id)+" to "+str(new_id))
motor_id = new_id

# set motor to 100
motors.set_goal_position({motor_id:100})
input("Motor position: 100; attach horn, press 'Enter' to continue. ")
# set motor to 100
motors.set_goal_position({motor_id:150})
input("Motor position: 150; tighten string around ear so that it's lined against the ear holder, press 'Enter' to continue. ")

quit()