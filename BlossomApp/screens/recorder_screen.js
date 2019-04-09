import React from 'react';
import { RotationViewController } from '../components/rotation_view_controller';
import { RecordingViewController } from '../components/recording_view_controller';
import { DefaultScreen } from './default_screen';
import { ServerForm } from '../components/_server_form';
import { ConnectionStatus } from '../components/connection_status'

export class RecorderScreen extends React.Component {
  render() {
    return (
        <DefaultScreen>
          <ServerForm />
          <RotationViewController />
          <RecordingViewController />
        </DefaultScreen>
    );
  }
}
