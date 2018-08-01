import React from 'react';
import { AsyncStorage } from 'react-native';
import { Content } from 'native-base';

import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

/**
 * App for recording and playing blossom gestures
 */
export class BlossomApp extends React.Component {
  async componentDidMount() {
    AsyncStorage.getItem('@BlossomApp:host')
      .then(host => {
        if (host) {
          SocketStore.dispatch(SocketAction.setSocket({ host }));
        }
      })
      .catch(() => {});
      AsyncStorage.getItem('@BlossomApp:port')
        .then(port => {
          if (port) {
            SocketStore.dispatch(SocketAction.setSocket({ port }));
          }
        })
        .catch(() => {});
  }

  render() {
    return (
      <Content>
        { this.props.children }
      </Content>
    );
  }
}
