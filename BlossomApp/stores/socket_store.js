import { createStore } from 'redux';

// MH: nesting reducers in stores because we live dangerously
const defaultState = {
  host: "localhost",
  port: "8000",
  isControlOn: false,
  lastRecording: null,
  sequences: [],
  mirror: false,
}
export const blossomReducer = (state=defaultState, action) => {
  switch (action.type) {
    case 'SET_SOCKET':
      let newState = state;
      newState.host = action.host || newState.host;
      newState.port = action.port || newState.port;
      return newState;
    case 'SET_CONTROL_ON':
      return Object.assign({}, state, action);
    case 'SET_LAST_RECORDING':
      return Object.assign({}, state, { lastRecording: action.name });
    case 'SET_SEQUENCES':
      return Object.assign({}, state, { sequences: action.sequences });
    case 'ADD_SEQUENCE':
      state.sequences.push(action.sequence)
      return state;
    case 'SET_MIRROR':
      return Object.assign({}, state, { mirror: action.mirror });
    default:
      return state;
  }
};

let SocketStore = createStore(blossomReducer);

export default SocketStore;
