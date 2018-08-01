import React from 'react';
import { Button } from 'react-native';
import { Text, Icon } from "native-base";
import { Ionicons,  MaterialCommunityIcons} from '@expo/vector-icons';

import { StyleSheet, RefreshControl } from 'react-native';

export class LoopButton extends React.Component {

    constructor(props){
      super(props);

      this.render = this.render.bind(this);
    }

    render() {
      var c = "md-repeat";
      var butStyle;
      var txt;
       if(!this.props.isLoop){
       txt = "not Loop";
       butStyle = styles.button;
     }
       else{
       txt = "Loop";
       butStyle = styles.buttonActive;
     }

     var icon =
     (<Icon name={c} size={80} color="#99ccff"
     onPress = {this.props.loopChange}
     style={butStyle}/>);
       return icon;

    }

}

const styles = StyleSheet.create({
  button: {

  },
  buttonActive: {
    color: "#33ba2e",
  },
  seqList: {
    flex: 1, // not working
  }
});
