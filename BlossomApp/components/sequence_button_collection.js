import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, RefreshControl } from 'react-native';
import { Content, Text } from 'native-base';
import { SequenceButton } from './sequence_button';

import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

export class SequenceButtonCollection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      host: "localhost",
      port: 8000,
      sequences: [],
      isRefreshing: false,
    }

    this.updateSequences = this.updateSequences.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
  }


  componentDidMount() {
    SocketStore.subscribe(() => {
      const newState = SocketStore.getState();
      this.setState({
        host: newState.host,
        port: newState.port,
        sequences: newState.sequences,
      });
    });

    this.updateSequences();
  }

  componentWillUnmount() {
    this.unsubscibe();
  }

  canSend(host, port) {
    return this.isValidHost(this.state.host) && this.isValidPort(this.state.port);
  }

  updateSequences() {
    this.setState({isRefreshing: true})
    if (this.canSend(this.state.host, this.state.port)) {
      const port = this.state.port ? ":" + this.state.port : "";
      fetch(`http://${this.state.host + port}/sequences`)
        .then(response => {
          response.json().then(data => {
            this.setState({isRefreshing: false});
            SocketStore.dispatch(SocketAction.setSequences(data));
          })
        })
        .catch(() => {
          this.setState({isRefreshing: false});
          setTimeout(this.updateSequences, 1000);
        });
    } else {
      SocketStore.dispatch(SocketAction.setSequences([]));
      // retry every 1 sec until we can send
      setTimeout(this.updateSequences, 1000);
    }
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

  handlePlay(seq) {
    // if (this.canSend(this.state.host, this.state.port)) {
    //   SocketStore.dispatch(SocketAction.setControlOn(false));
    //   fetch(`http://${this.state.host}:${this.state.port}/s/${seq}`)
    //   .catch(() => {});
    // }

    this.props.onPress(seq);

  }

  renderButtons() {
    let id = 0;

    return this.state.sequences.map(sequence => {

        const duration = sequence[1];
        const name = sequence[0] + " - " +duration +" sec";
        id += 1;
        return (
          <SequenceButton
            block
            style={styles.button}
            sequence={name}
            key={`sequence_${id}`}
            onPlay={this.handlePlay}
            active={sequence === this.props.activeSeq} />
        )
      }
    );
  }

  renderRefresh() {
    return (
      <RefreshControl
        refreshing={this.state.isRefreshing}
        onRefresh={this.updateSequences} />
    );
  }

  render() {
    return (
      <Content
        scrollEnabled = {true}
        refreshControl={this.renderRefresh()}
        style={styles.seqList} >
        {this.renderButtons()}
      </Content>
    );
  }
}

SequenceButtonCollection.propTypes = {
  onPress: PropTypes.func.isRequired,
  activeSeq: PropTypes.string,
};

const styles = StyleSheet.create({
  selButton: {
    marginBottom: 10,
    backgroundColor: "#2e4c7a",
  },
  button: {marginBottom: 10,},
  seqList: {
    height : 400,
  }
});
