import matplotlib.pyplot as plt
import threading

class LivePlot():
    # init
    def __init__(self,num_subplots=1):
        self.line_list = []
        self.ax_list = []
        self.num_subplots = num_subplots
        self.xdata = []
        self.ydata = []

      

        self.fig = plt.figure()
        for i in range(0,num_subplots):
            ax = self.fig.add_subplot(num_subplots,1,i+1)
            self.ax_list.append(ax)
            line, = ax.plot([],[])
            self.line_list.append(line)

        

    # update
    def update(self):
        
        for i,ydata_i in enumerate(self.ydata):
            plt.subplot(self.num_subplots,1,i+1)
            ydata_i = [y_i[i] for y_i in self.ydata]
            self.ax_list[i].plot(self.xdata, ydata_i,'C0')
        plt.pause(0.00001)

    def add_data(self,xdata,ydata):
        self.xdata.append(xdata)
        self.ydata.append(ydata)