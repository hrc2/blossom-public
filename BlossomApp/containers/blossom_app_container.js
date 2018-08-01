// MH: This doesn't actually do anything, its just an example of how we should be passing in store states as props in the screens (but aren't)

import React from 'react';
import { AsyncStorage } from 'react-native';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Content } from 'native-base';

import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

class BlossomApp extends React.Component {
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

const mapStateToProps = state => ({
  host: state.host,
  port: state.port,
  isControlOn: state.isControlOn,
  lastRecording: state.lastRecording,
});

const mapDispatchToProps = (dispatch) => ({
  setSocket: () => { dispatch({ type: 'SET_SOCKET' }) },
  setControlOn: () => { dispatch({ type: 'SET_CONTROL_ON' }) },
  setLastRecording: () => { dispatch({ type: 'SET_LAST_RECORDING' }) },
});

export default connect(mapStateToProps, mapDispatchToProps)(BlossomApp)
