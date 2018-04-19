import React from 'react';
import PropTypes from 'prop-types';

/**
 * A button that fires a sequence
 */
export class GestureButton extends React.PureComponent {
  handleClick() {
    const seq = this.props.name;
    fetch(`/s/${seq}`)
      .then((response) => { console.log(`${seq} gesture fired`) });
  }

  render() {
    return (
      <div id = {this.props.name} className="row">
        <div className="col-xs-4">
          <input
            id={this.props.name}
            className="btn btn-primary"
            type="button"
            value={this.props.name}
            onClick={this.handleClick.bind(this)} >
          </input>
        </div>
      </div>
    );
  }
}

GestureButton.propTypes = {
  name: PropTypes.string.isRequired,
}
