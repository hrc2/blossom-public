import React from 'react';
import { GestureMenuVC } from "./gesture_menu_view_controller";

/**
 * An app for browsing and playing sequences.
 */
export class GestureApp extends React.Component {
  render() {
    return (
      <div className="gesture-app">
        <div className="container">
          <h1 className="text-center">Blossom Controls</h1>
          <h4>Scroll for more buttons</h4>

          <div className="blossom-controls">
            <GestureMenuVC />
          </div>
        </div>
      </div>
    );
  }
}
