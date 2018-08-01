import React from 'react';
import { View } from 'react-native';
import { DefaultScreen } from './default_screen';
import { SequenceButton } from '../components/sequence_button';
import { Text } from "native-base";
import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

export class GenerationScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      host: "localhost",
      port: 8000,
    }

    this.generateGesture = this.generateGesture.bind(this);
  }

  componentDidMount() {
    // MH: Ideally these get passed in as props, should refactor one day
    SocketStore.subscribe(() => {
      const newState = SocketStore.getState();
      this.setState({
        host: newState.host,
        port: newState.port,
      });
    });
  }

  canSend(host, port) {
    return this.isValidHost(this.state.host) && this.isValidPort(this.state.port);
  }

  isValidHost(host) {
    if (host.match(/[a-zA-Z]/i)) {
      return true;
    }
    const splitHost = host.split(".")
    return splitHost.length == 4 && splitHost[3];
  }

  isValidPort(port) {
    return !port || port > 6000 && port < 49000;
  }

  generateGesture(emotion) {
    if (this.canSend(this.state.host, this.state.port)) {
      SocketStore.dispatch(SocketAction.setControlOn(false));
      const port = this.state.port ? ":" + this.state.port : "";
      fetch(`http://${this.state.host}:${this.state.port}/generate?emotion=${emotion}`)
      .catch(() => {});
    }
  }

  renderButtons() {
    const emotions = ["happy", "sad", "anger", "fear"]
    return emotions.map(emotion =>
      (
        <SequenceButton
          block
          style={{marginBottom: 10}}
          sequence={emotion}
          key={emotion}
          onPlay={this.generateGesture} />
      )
    );
  }

  render() {
    return (
      <DefaultScreen>
        <Text style={{fontSize: 20, padding: 30, textAlign: "center"}}>
          Select a sequence to generate:
        </Text>
        {this.renderButtons()}
      </DefaultScreen>
    );
  }
}
