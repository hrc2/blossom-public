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

        # self.fig, self.ax_list = plt.subplots(num_subplots,1)
        # [self.line_list.append(ax.plot([],[])[0]) for ax in self.ax_list]

        # [self.ax_list.append([]) for i in range(0,num_subplots)]
        # self.ax_list = tuple(ax_list)
        # self.fig, self.ax_list = plt.subplots(num_subplots,1)
        # self.fig = plt.figure()
        # [self.ax_list.append(plt.plot([],[])) for i in range(0,num_subplots)]
        # self.l_list = []
        # [self.l_list.append(ax.plot([],[])) for ax in self.ax_list]

        self.fig = plt.figure()
        for i in range(0,num_subplots):
            ax = self.fig.add_subplot(num_subplots,1,i+1)
            self.ax_list.append(ax)
            line, = ax.plot([],[])
            self.line_list.append(line)

        # update_thread = threading.Thread(target=self.update)
        # update_thread.daemon=True
        # update_thread.start()

        # while(1):
        #     print(self.xdata)
            # plt.pause(1)
            # plt.draw()

    # update
    def update(self):
        # [self.line_list[i].set_data(xdata,ydata_i) for i,ydata_i in enumerate(ydata)]
        for i,ydata_i in enumerate(self.ydata):
            plt.subplot(self.num_subplots,1,i+1)
            ydata_i = [y_i[i] for y_i in self.ydata]
            self.ax_list[i].plot(self.xdata, ydata_i,'C0')
        plt.pause(0.00001)

    def add_data(self,xdata,ydata):
        self.xdata.append(xdata)
        self.ydata.append(ydata)