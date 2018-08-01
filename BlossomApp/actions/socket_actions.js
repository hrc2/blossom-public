export default SocketActions = {
  setSocket: data => {
    action = {type: "SET_SOCKET"};
    if (data.host) {
      action.host = data.host;
    }
    if (data.port) {
      action.port = data.port;
    }
    return action;
  },
  setControlOn: isControlOn => {
    return {
      type: "SET_CONTROL_ON",
      isControlOn,
    };
  },
  setLastRecording: name => {
    return {
      type: "SET_LAST_RECORDING",
      name,
    };
  },
  setSequences: seqs => {
    return {
      type: "SET_SEQUENCES",
      sequences: seqs,
    };
  },
  addSequence: seq => {
    return {
      type: "ADD_SEQUENCE",
      sequence: seq,
    };
  },
  setMirror: mirror => {
    return {
      type: "SET_MIRROR",
      mirror,
    }
  }
}
