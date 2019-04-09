import React from 'react';
import { Text } from "native-base";
import { DefaultScreen } from './default_screen';
import { SequenceButtonCollection } from '../components/sequence_button_collection';
import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';
import {PlayBar} from '../components/play_bar';
import { StyleSheet, View } from 'react-native';
import {PauseTimer} from '../components/pause_timer';
import { ConnectionStatus } from '../components/connection_status';

export class SequencesScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      playPressed: false,
      storedSequence: "",
      useSequence: false,
      host: "localhost",
      port: 8000,
      idling: false,
      isPlaying:false,
    }
    this.render = this.render.bind(this);
    this.setSequence = this.setSequence.bind(this);
    this.setPlayTrue = this.setPlayTrue.bind(this);
    this.setButtonViewToPause = this.setButtonViewToPause.bind(this);
    this.canSend = this.canSend.bind(this);
    this.setIdling = this.setIdling.bind(this);
  }

  setIdling(shouldRepeat){
    this.setState({idling: shouldRepeat});
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

  playSequence(seq){
    console.log("play "+seq);
    seqs = seq.split(" - ")[0];
    if(this.state.useSequence){
      if (this.canSend(this.state.host, this.state.port)) {
        SocketStore.dispatch(SocketAction.setControlOn(false));
        const port = this.state.port ? ":" + this.state.port : "";
        if(this.state.idling)
        {
          fetch(`http://${this.state.host}:${this.state.port}/s/${seqs}=${seqs}`)
          .catch(() => {});
        }
        else{
          fetch(`http://${this.state.host + port}/s/${seqs}`)
            .catch(() => {});
        }
      }
    }
  }

  setButtonViewToPause(){
    console.log("pause");
    this.setState({isPlaying:false,});
  }

  setPlayTrue(){
    if(! this.state.isPlaying){
      this.setState({isPlaying:true,});

      var seqs = this.state.storedSequence
      this.playSequence(seqs);

    }
    else{
      console.log("pause");
      //TODO: make sure pause code works
      this.setState({isPlaying:false,});
      if (this.canSend(this.state.host, this.state.port)) {
        SocketStore.dispatch(SocketAction.setControlOn(false));
          fetch(`http://${this.state.host}:${this.state.port}/s/reset`)
          .catch(() => {});

      }
    }
    //console.log(this.state.storedSequence);
  }

  setSequence(str){
    this.setState({storedSequence: str,
    useSequence: true});
    this.setState({isPlaying:true});
    this.playSequence(str);
  }


  render() {
    var storedTime = 0;
    if(this.state.storedSequence != null && this.state.storedSequence != ""){
      storedTime = this.state.storedSequence.split(" - ")[1];
      console.log(storedTime + "storedTime" + this.state.storedSequence);
      storedTime = parseFloat(storedTime.split("sec")[0]);
    }

    var pTimer = null;

    if(storedTime != 0 && this.state.isPlaying ) {
      console.log("NEW TIMER");
      pTimer = (<PauseTimer
      countAmount = {storedTime}
      isPlaying = {this.state.isPlaying}
      pauseMethod = {this.setButtonViewToPause}/>);
    }



    return (
      <View  style={styles.screenScroll} scrollEnabled={false}>
        {pTimer}
        <ConnectionStatus />
        <SequenceButtonCollection
          onPress={this.setSequence}
          activeSeq={this.state.storedSequence}/>
        <PlayBar
          isPlaying={this.state.isPlaying}
          onPlay={this.setPlayTrue}
          shouldLoop={this.state.idling}
          setIdle={this.setIdling} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screenScroll: {
      width: '100%',
      position: 'absolute',
      marginBottom: 0
  },
  button: {marginBottom: 10},
  seqList: {
    flex: 1, // not working
  }
});
