import React from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, RefreshControl} from 'react-native';
import Modal from "react-native-modal";
import { Content, Text, Button, Icon, Form, Item, Input, Label } from 'native-base';
import { SequenceForm } from "./sequence_form";

import SocketStore from '../stores/socket_store';
import SocketAction from '../actions/socket_actions';

/**
 * A recording button that starts/stops recording and triggers a modal on finish that prompts the user to name and label the gesture
 */
export class RecordingViewController extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      host: "localhost",
      port: 8000,
      isLoading: false,
      isRecording: false,
      modalVisible: false,
      gestureTmpName: "",
      classification: "",
    };

    this.unsubscibe = SocketStore.subscribe(() => {
      const newState = SocketStore.getState();
      this.setState({
        host: newState.host,
        port: newState.port,
      });
    });

    this.openModal = this.openModal.bind(this);
    this.handleStartRecording = this.handleStartRecording.bind(this);
    this.handleStopRecording = this.handleStopRecording.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.unsubscibe();
  }

  canSend(host, port) {
    return host && port && this.isValidHost(this.state.host) && this.isValidPort(this.state.port) && !this.state.isLoading;
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

  handleStartRecording() {
    if (this.canSend(this.state.host, this.state.port)) {
      this.setState({isLoading: true});
      SocketStore.dispatch(SocketAction.setControlOn(true));
      const port = this.state.port ? ":" + this.state.port : "";
      fetch(`http://${this.state.host + port}/record/start`, {
        method: 'POST',
      }).then(response => {
          this.setState({isLoading: false, isRecording: true});
        }).catch(error => {
          this.setState({isLoading: false, isRecording: false});
        });
    }
  }

  handleStopRecording() {
    const name = this.state.name
    if (this.canSend(this.state.host, this.state.port)) {
      this.setState({isLoading: true});
      SocketStore.dispatch(SocketAction.setControlOn(false));
      const port = this.state.port ? ":" + this.state.port : "";

      // Request recording stop
      const req = fetch(`http://${this.state.host + port}/record/stop`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      }).then(response => {
        response.json().then(data => {
          this.setState({
            gestureTmpName: data.name,
            isLoading: false,
            isRecording: false,
          });
          fetch(`http://${this.state.host + port}/classify_sequence/${data.name}`).then(response => {
            response.text().then(data => {
              if (["happy", "sad", "anger", "fear"].includes(data)) {
                this.setState({classification: data});
              }
            });
          });
          this.openModal();
        });
      }).catch(error => {
        this.setState({
          gestureTmpName: "",
          isLoading: false,
          isRecording: false,
        });
      });
    }
  }

  renderStartButton() {
    return (
      <Button
        success
        block
        disabled={this.state.isLoading}
        onPress={this.handleStartRecording}
        style={styles.button}>
        <Icon name='radio-button-on' />
        <Text>Start Recording</Text>
      </Button>
    );
  }

  renderStopButton() {
    return (
      <Button
        danger
        block
        disabled={this.state.isLoading}
        onPress={this.handleStopRecording}
        style={styles.button}>
        <Icon name='square' />
        <Text>Stop Recording</Text>
      </Button>
    );
  }

  renderForm() {
    const badName = !this.state.name;

    return (
      <Form>
        <Item
          stackedLabel
          error={badName} >
          <Label>Sequence Name</Label>
          <Input
            onChangeText={ text => {this.setState({name: text})} }
            value={this.state.name} />
        </Item>
      </Form>
    );
  }

  openModal() {
    this.setState({modalVisible: true});
  }

  handleSubmit(name, label) {
    this.setState({isLoading: true});
    const port = this.state.port ? ":" + this.state.port : "";
    fetch(`http://${this.state.host + port}/sequences/${this.state.gestureTmpName}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, label }),
    })
      .then(response => {
        SocketStore.dispatch(SocketAction.addSequence([name, "???"]));
        this.setState({
          modalVisible: false,
          isLoading: false,
          classification: "",
        });
      });
  }

  handleCancel() {
    this.setState({
      modalVisible: false,
      classification: "",
    });
  }

  renderModal() {
    return (
      <Modal
        isVisible={this.state.modalVisible}
        animationIn="slideInLeft"
        animationOut="slideOutRight"
        onBackButtonPress={this.handleCancel}
        onBackdropPress={this.handleCancel}
        swipeDirection="right"
        onSwipe={this.handleCancel} >
        <View style={styles.modalContent}>
          <SequenceForm
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmit}
            isLoading={this.state.isLoading}
            classification={this.state.classification} />
        </View>
      </Modal>
    );
  }

  render() {
    let button = null;
    if (this.state.isRecording) {
      button = this.renderStopButton();
    } else {
      button = this.renderStartButton();
    }

    return (
      <View>
        {button}
        {this.renderModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    maxHeight: 400,
    flex: 1,
  },
});
