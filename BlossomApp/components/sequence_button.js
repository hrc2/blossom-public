import React from 'react';
import PropTypes from 'prop-types';
import { Text, Button } from 'native-base';

export class SequenceButton extends React.PureComponent {
  render() {
    return (
      <Button
        block={this.props.block}
        onPress={this.playSeq.bind(this)}
        style={this.props.style}
        disabled={this.props.active} >
        <Text>{this.props.sequence}</Text>
      </Button>
    );
  }

  playSeq() {
    this.props.onPlay(this.props.sequence);
  }
}

SequenceButton.propTypes = {
  sequence: PropTypes.string.isRequired,
  onPlay: PropTypes.func.isRequired,
  block: PropTypes.bool,
  active: PropTypes.bool,
};
