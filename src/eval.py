import kinematics as k
import matplotlib.pyplot as plt
import numpy as np

plt.rc('text', usetex=True)
# plt.rc('font', family='serif')

m_rest = 100

# fontsize
fs = 40

motor_pos = np.array(range(-80,150,20))-m_rest
h = np.array([1+6.0/16, 1+3.0/16, 1+1.0/16, 14.5/16, 11.5/16, 9.5/16, 6.5/16, 4.0/16, 1.5/16, 0, -1+12.5/16, -1+10.0/16])
# convert to mm
h = h*-25.4
 
h_calc = np.array([])
# h_calc = [np.append(h_calc,k.fwd_kin(m)) for m in motor_pos]
h_calc = [k.fwd_kin(m) for m in motor_pos]

# error = calculated - physical (actual)
e = h_calc-h
# square error
se = np.power(e,2)
# absolute error
ae = np.abs(e)
print(ae)
print(np.mean(ae))
print(np.std(ae))

plt.plot(motor_pos,h)
plt.plot(motor_pos,h_calc,'--')
plt.legend([r"Actual",r"Calculated"],fontsize=20)
plt.grid(True)
plt.xlabel(r"\Delta \theta (rad)",fontsize=20)
plt.ylabel(r"\Delta h_z (mm)",fontsize=20)
plt.savefig('/Users/PsychoMugs/Blossom/papers/blossom-uist/figures/eval.jpg')
plt.show()
