import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Text } from 'native-base';

export class ResetButton extends React.PureComponent {
  render() {
    return (
      <Button
        transparent
        onPress={this.props.onReset} >
        <Icon name='refresh' />
        <Text>Reset Height</Text>
      </Button>
    );
  }
}

ResetButton.propTypes = {
  onReset: PropTypes.func,
};
