import React from 'react';
import PropTypes from 'prop-types';
import { DangerZone } from 'expo';
import { StyleSheet, Slider, StatusBar, Platform, View, ScrollView } from 'react-native';
import { ResetButton } from './reset_button';
import { Content, Button, Text, Switch } from 'native-base';

import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

/**
 * Controls for controlling blossom
 */
export class RotationViewController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      h: 50,
      ears: 50,
      hDisp: 50,
      earsDisp: 50,
      host: "localhost",
      port: 8000,
      sendData: false,
      badSensor: true,
      mirror: false,
    };

    this.handleToggle = this.handleToggle.bind(this);
    this.handleData = this.handleData.bind(this);
    this.handleReset = this.handleReset.bind(this);

    this.sensorListener = DangerZone.DeviceMotion.addListener(this.handleData);

    this.unsubscibe = SocketStore.subscribe(() => {
      const newState = SocketStore.getState();
      this.setState({
        host: newState.host || this.state.host,
        port: newState.port || this.state.port,
        sendData: newState.isControlOn,
        mirror: newState.mirror,
      });
    });
  }

  componentDidMount() {
    this.slider.setNativeProps({value: 70});
    this.ears.setNativeProps({value: 50});
  }

  componentWillUnmount() {
    this.unsubscibe();
    this.sensorListener.remove();
  }

  handleData(data) {
    if (data.rotation && data.acceleration) {
      let { alpha, beta, gamma } = data.rotation;
      let { x, y, z } = data.acceleration;

      if (Number.isNaN(beta) || this.state.badSensor) {
        this.setState({badSensor: Number.isNaN(beta)});
      }

      const canSend = this.isValidHost(this.state.host) && this.isValidPort(this.state.port) && this.state.sendData;
      const port = this.state.port ? ":" + this.state.port : "";
      if (canSend) {
        fetch(`http://${this.state.host + port}/position`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Connection: "keep-alive",
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            x: beta,
            y: gamma,
            z: alpha,
            h: this.state.h,
            ears: this.state.ears,
            ax: x,
            ay: y,
            az: z,
            mirror: this.state.mirror,
          }),
        })
        .catch(() => {});
      }
    }
  }

  isValidHost(host) {
    if (!host) {
      return false;
    }
    if (host.match(/[a-zA-Z]/i)) {
      return true;
    }
    const splitHost = host.split(".")
    return splitHost.length == 4 && splitHost[3];
  }

  isValidPort(port) {
    return !port || port > 6000 && port < 49000;
  }

  handleToggle(val) {
    SocketStore.dispatch(SocketAction.setControlOn(!this.state.sendData));
  }

  handleReset() {
    const port = this.state.port ? ":" + this.state.port : "";
    fetch(`http://${this.state.host + port}/reset`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        h: this.state.h,
      }),
    })
    .then(() => {
      this.slider.setNativeProps({value: 70});
      this.setState({ h: 70, hDisp: 50 });
    })
    .catch(() => {});
  }

  renderForm() {
    const badHost = !this.isValidHost(this.state.host);
    const badPort = !this.isValidPort(this.state.port);

    return (
      <Content style={styles.form}>
        <Text>Control Robot</Text>
        <Switch
          style={{height: 35}}
          value={this.state.sendData}
          onValueChange={this.handleToggle}
          disabled={badHost || badPort || this.state.badSensor} />
      </Content>
    );
  }

  renderHeightSlider() {
    return (
      <Content>
        <Text>Height: {this.state.hDisp}</Text>
        <Slider
          style={{transform: [{rotate: '270deg'}], height: 300}}
          ref={r => this.slider = r}
          disabled={!this.state.sendData}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onValueChange={val => {
            this.setState({ h: val });
          }}
          onSlidingComplete={val => {
            this.setState({ hDisp: val });
          }} />
      </Content>
    );
  }

  renderEarSlider() {
    return (
      <Content>
        <Text>Ears: {this.state.earsDisp}</Text>
        <Slider
          ref={r => this.ears = r}
          minimumValue={0}
          maximumValue={100}
          step={1}
          style={styles.earSlider}
          disabled={!this.state.sendData}
          onValueChange={val => {
            this.setState({ ears: val });
          }}
          onSlidingComplete={val => {
            this.setState({ earsDisp: val });
          }} />
      </Content>
    );
  }

  render() {
    const port = this.state.port ? ":" + this.state.port : "";

    return (
      <Content>
        { this.renderForm() }
        { this.renderHeightSlider() }
        <ResetButton onReset={this.handleReset} />
        { this.renderEarSlider() }
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  sensor: {
    paddingBottom: 30,
  },
  form: {
    paddingTop: 10,
  },
  earSlider: {
    paddingBottom: 50,
  }
});
