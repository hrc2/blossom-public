import React from 'react';
import { Text, Icon } from "native-base";
import { DefaultScreen } from './default_screen';
import { ServerForm } from '../components/server_form';

export class SettingsScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Settings',
    drawerIcon: (<Icon name='settings' />),
  };

  render() {
    return (
      <DefaultScreen>
        <ServerForm />
      </DefaultScreen>
    );
  }
}
