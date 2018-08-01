import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'native-base';

export class NavButton extends React.PureComponent {
  render() {
    return (
      <Button
        transparent
        onPress={() => {
          this.props.navigation.navigate('Settings');
        }} >
        <Icon name='settings' />
      </Button>
    );
  }
}
