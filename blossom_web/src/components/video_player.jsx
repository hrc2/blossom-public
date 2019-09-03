import React from 'react';
import PropTypes from 'prop-types';
import YouTube from "react-youtube";

/**
 * A player that triggers blossom gestures at specific times according the the sequences 
 * for a video.
 */
export class VideoPlayer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      timecode: "0",
      emotion: ""
    }
    this.handleReady = this.handleReady.bind(this);

    this.triggers = this.props.triggers || [];
    this.times = this.triggers.map(gesture => gesture.time);

    this.timeupdater = null;
    this.clearEmotion = null;
    this.videotime = 0;
    this.prevEmotion = this.nextEmotion = 0;
    this.endEmotion = 0;
  }

  componentWillUnmount() {
    clearInterval(this.triggerEmotion);
  }

  render() {
    const opts = {
      width: '1080',
      height: '608'
    };
    return (<div className="player">
      <YouTube videoId={this.props.videoId} opts={opts} onReady={this.handleReady}/>
    </div>);
  }

  /**
   * Plays the video once the player is ready. Triggers a function every 100 ms that updates the videotime and checks if any gestures were triggered.
   */
  handleReady(event) {
    event.target.playVideo();

    const updateTime = () => {
      const oldTime = this.videotime;
      this.videotime = event.target.getCurrentTime();
      if (this.videotime !== oldTime) {
        this.setState({
          timecode: this.pad(this.videotime.toFixed(1), 5)
        });
        this.checkEmotion(Math.round(this.videotime * 1000));

        if (Math.abs(this.videotime - oldTime) > .2) {
          this.handleJump(Math.round(this.videotime * 1000));
        }
      }
    }

    this.timeupdater = setInterval(updateTime, 100);
  }

  /**
   * handle scrubbing events in the video player by updating the next and prev emotions
   */
  handleJump(time) {
    this.nextEmotion = this.getNextEmotion(time);
    this.prevEmotion = this.nextEmotion - 1;

    if (this.triggers[this.prevEmotion]) {
      this.triggerEmotion(this.triggers[this.prevEmotion]);
    }
  }

  /**
   * timecode padding (print 0s in front)
   */
  pad(num, size) {
    let s = num + "";
    while (s.length < size)
      s = "0" + s;
    return s;
  }

  /**
   * Check if an emotion has been triggered for the given time. 
   * If so, update the next and prev emotions.
   */
  checkEmotion(time) {
    if (this.triggers[this.nextEmotion] === undefined) {
      return null;
    }
    if (time > this.triggers[this.nextEmotion].time || time < this.triggers[this.prevEmotion].time) {
      this.nextEmotion = this.getNextEmotion(time);
      this.prevEmotion = this.nextEmotion - 1;
    }

    const em = this.triggers[this.nextEmotion];
    if (Math.abs(em.time - time) <= 150) {
      console.log(em);
      this.triggerEmotion(em);
    }
  }

  /**
   * Binary search for the next emotion
   */
  getNextEmotion(time) {
    let [start, end] = [
      0, this.times.length - 1
    ];
    while (end - start > 1) {
      const mid = Math.floor((start + end) / 2)
      if (this.times[mid] < time) {
        start = mid;
      } else {
        end = mid;
      }
    }
    return end;
  }

  /**
   * play the given emotion
   */
  triggerEmotion(em) {
    clearTimeout(this.clearEmotion);
    this.setState({emotion: em.emotion});
    this.handleEmotion(em)

    if (!em.duration) {
      em.duration = 99999999;
    }
    this.clearEmotion = setTimeout(this.triggerEmotion, em.duration, {
      "emotion": "*",
      "gesture": "idle",
      "duration": 3000
    });
  }

  handleEmotion(em) {
    console.log(em);
    const msg = "/s/" + em.gesture;

    this.setState({
      emotion: em.emotion + " -> " + msg
    });
    fetch(msg, function(data, status) {}).catch(error => {});
  }
}

VideoPlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
  triggers: PropTypes.arrayOf(PropTypes.object)
}
