import React from 'react';
import { Text } from "native-base";

export class PauseTimer extends  React.Component {

  constructor(props) {
    //props should have a variable called countAmount
    super(props);

    this.state = {
      timer: null,
      counter: 0,
      isMount: false,
    }

    this.render = this.render.bind(this);
    this.tick = this.tick.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);


  }

  componentDidMount() {

    console.log("MOUNTING------------");
      if(this.props.countAmount != 0 && this.props.countAmount != null){
          this.setState({isMount: true,});
          this.timer = setInterval(this.tick, this.props.countAmount * 1000);
        console.log(this.props.countAmount + "COUNT AMNT");
      }
      else{
        console.log("is 0");
      }
    }

  componentWillUnmount(){
    let timer = clearInterval(this.timer);
    clearInterval(this.timer);
  }


  tick() {
    if(this.props.countAmount != null && (this.state.isMount)){
      this.props.pauseMethod();
    }

  }
  render() {
    console.log("timer done "+ this.props.countAmount);
  //  clearInterval(this.timer);
    return null;
    //console.log("tick");
    //return <Text text = {this.state.counter} />;
  //  <div>PauseTimer{"...".substr(0, this.state.counter % 3 + 1)}</div>
  }

}
