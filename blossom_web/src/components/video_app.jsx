import React from 'react';
import { VideoCollection } from "./video_collection";
import { VideoPlayer } from "./video_player";
import { GestureApp } from "./gesture_app";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";

/**
 * An app for running blossom video demos.
 */
export class VideoApp extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      videoData: {},
    };

    this.renderHome = this.renderHome.bind(this);
    this.renderPlayer = this.renderPlayer.bind(this);
    this.renderRoutes = this.renderRoutes.bind(this);
  }

  componentWillMount() {
    fetch(`/videos`)
      .then(response => {
        response.json().then(data => {
          this.setState({videoData: data});
        });
      })
      .catch(error => {
        console.log(error);
        console.log("error getting videos");
      });
  }

  renderHome() {
    return (
      <div>
        <div className="video-collection-wrapper">
          <VideoCollection videoData={this.state.videoData} />
        </div>
        <Link to="/gestures">
          <div className="btn btn-primary">
            Go to Gesture Controls
          </div>
        </Link>
      </div>
    );
  }

  renderPlayer(videoId) {
    return (
      <div>
        <VideoPlayer
          videoId={videoId}
          triggers={this.state.videoData[videoId]} />
        {this.renderHome()}
      </div>
    );
  }

  renderRoutes() {
    return (
      <div>
        <Route exact path="/" component={this.renderHome} />
        {
          Object.keys(this.state.videoData).map(videoId => {
            return (
              <Route
                key={videoId}
                path={`/video/${videoId}`}
                component={() => this.renderPlayer(videoId)} />
            )
          })
        }
        <Route exact path="/gestures" component={GestureApp} />
      </div>
    );
  }

  render() {
    return (
      <div className="video-app">
        <div className="container">
          <Router>
            {this.renderRoutes()}
          </Router>
        </div>
      </div>
    );
  }
}
