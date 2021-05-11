import React from 'react';
import PropTypes from 'prop-types';
import { RefreshControl } from 'react-native';
import { Content, Text, Icon } from "native-base";
import { Ionicons,  MaterialCommunityIcons} from '@expo/vector-icons';

import { Button, View, StyleSheet  } from 'react-native';
import {LoopButton} from '../components/loop_button';
import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

export class PlayBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLooping: false,
    }
    this.playSeq = this.playSeq.bind(this);

    this.changeLoop = this.changeLoop.bind(this);
  }

  playSeq() {
    this.props.onPlay();
  }

  changeLoop() {
    var isLoop = ! (this.state.isLooping);
    this.setState({isLooping: isLoop});
    this.props.setIdle(isLoop);
  }

  render() {
    var c = this.props.isPlaying ? "md-pause" : "md-play";

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <LoopButton
                    isLoop={this.props.shouldLoop}
                    loopChange={this.changeLoop}
                />
            </View>

            <Icon
                name={c} size={80} color="#99ccff"
                onPress={this.playSeq}
                style={styles.buttonContainer}
            />
        </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: "#a9b8c9",
    },
    buttonText: {
      color: "#131c38",
    },
    buttonContainer: {
        flex: 1,
        paddingRight: 30,
        paddingLeft: 30,
        marginBottom: 10,
        alignItems: 'flex-end',
    }
});
