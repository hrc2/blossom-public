import React from 'react';
import { RotationViewController } from '../components/rotation_view_controller';
import { RecordingViewController } from '../components/recording_view_controller';
import { DefaultScreen } from './default_screen';

export class RecorderScreen extends React.Component {
  render() {
    return (
      <DefaultScreen>
        <RotationViewController />
        <RecordingViewController />
      </DefaultScreen>
    );
  }
}
