import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Icon } from "native-base";

import SocketStore from '../stores/socket_store';

export class ConnectionStatus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            host: "localhost",
            port: 8000,
            sendData: false
        };

        this.unsubscibe = SocketStore.subscribe(() => {
            const newState = SocketStore.getState();

            this.setState({
                host: newState.host ? newState.host : this.state.host,
                port: newState.port ? newState.port : this.state.port,
                sendData: newState.isControlOn
            });
        });
    }

    componentWillUnmount() {
        this.unsubscibe();
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

    render() {
        const canSend = this.isValidHost(this.state.host) && this.isValidPort(this.state.port) && this.state.sendData;

        return (
            <View style={ canSend ? styles.greenStatusBar : styles.redStatusBar }></View>
        );
    }
}

const styles = StyleSheet.create({
    greenStatusBar: {
        marginTop: 0,
        height: 20,
        backgroundColor: "#1AD600"
    },
    redStatusBar: {
      marginTop: 0,
      height: 20,
      backgroundColor: "red"
  }
});
