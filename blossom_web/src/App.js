import React, { Component } from 'react';
import './App.css';
import { VideoApp } from "./components/video_app";

class App extends Component {

  
  render() {
    return (
      <div className="App">
        <VideoApp />
      </div>
    );
  }
}

export default App;
