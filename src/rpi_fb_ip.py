import firebase_control as fc
import server
import socket

fc.fb_put(socket.gethostname()+'_pi','ip',server.get_ip_address())
