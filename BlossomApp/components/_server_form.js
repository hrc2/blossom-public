import React from 'react';
import { StyleSheet, AsyncStorage, Keyboard } from 'react-native';
import { Content, Button, Text, Form, Item, Input, Label, Switch } from 'native-base';
import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

/**
 * Form of designating the where http srequests are sent by the app
 */
export class ServerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = SocketStore.getState();

    this.keyboardListener = Keyboard.addListener('keyboardDidHide', this.saveDest.bind(this));
  }

  async componentDidMount() {
    AsyncStorage.getItem('@BlossomApp:host')
      .then(host => {
        if (host) {
          this.setState({ host });
        }
      })
      .catch(() => {});
    AsyncStorage.getItem('@BlossomApp:port')
      .then(port => {
        if (port) {
          this.setState({ port });
        }
      })
      .catch(() => {});
  }

  componentWillUnmount() {
    this.keyboardListener.remove();
    this.saveDest();
  }

  saveDest() {
    AsyncStorage.setItem('@BlossomApp:host', '' + this.state.host)
      .catch(() => {});
    AsyncStorage.setItem('@BlossomApp:port', '' + this.state.port)
      .catch(() => {});
    SocketStore.dispatch(SocketAction.setSocket(this.state));
  }

  isValidHost(host) {
    if (host.match(/[a-zA-Z]/i)) {
      return true;
    }
    const splitHost = host.split(".")
    return host && splitHost.length == 4 && splitHost[3];
  }

  isValidPort(port) {
    return !port || port > 6000 && port < 49000;
  }

  render() {
    const badHost = !this.isValidHost(this.state.host);
    const badPort = !this.isValidPort(this.state.port);
    const port = this.state.port ? ":" + this.state.port : "";

    return (
      <Content>
        <Text>Change Socket</Text>
        <Form>
          <Item
            stackedLabel
            error={badHost} >
            <Label>Host</Label>
            <Input
              onChangeText={ text => {this.setState({host: '' + text})} }
              value={'' + this.state.host}
              autoCapitalize="none" />
          </Item>
          <Item
            stackedLabel
            error={badPort} >
            <Label>Port</Label>
            <Input
              onChangeText={ text => {this.setState({port: '' + text})} }
              value={'' + this.state.port}
              keyboardType = 'numeric' />
          </Item>
          <Content style={styles.form}>
            <Text>Mirror</Text>
            <Switch
              value={this.state.mirror}
              onValueChange={() => {
                SocketStore.dispatch(SocketAction.setMirror(!this.state.mirror));
                this.setState({mirror: !this.state.mirror});
              }}
              disabled={badHost || badPort} />
          </Content>
        </Form>
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    paddingTop: 60,
  },
});
