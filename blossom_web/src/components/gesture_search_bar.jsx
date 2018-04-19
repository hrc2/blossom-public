import React from 'react';
import PropTypes from 'prop-types';

/**
 * A search bar.
 */
export class GestureSearchBar extends React.PureComponent {
  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Search for gestures..."
          name="search"
          onChange={this.props.onChange} />
      </div>
    );
  }
}

GestureSearchBar.propTypes = {
  onChange: PropTypes.func.isRequired,
}
