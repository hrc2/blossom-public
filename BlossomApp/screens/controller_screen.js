import React from 'react';
import { RotationViewController } from '../components/rotation_view_controller';
import { DefaultScreen } from './default_screen';

export class ControllerScreen extends React.Component {
  render() {
    return (
      <DefaultScreen>
        <RotationViewController />
      </DefaultScreen>
    );
  }
}
