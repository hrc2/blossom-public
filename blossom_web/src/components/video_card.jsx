import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

/**
 * An element of a VideoCollection
 */
export class VideoCard extends React.PureComponent {
  render() {
    const imgUrl = `https://img.youtube.com/vi/${this.props.videoId}/mqdefault.jpg`;

    return (
      <div className="video-card col-sm-4">
        <Link to={`/video/${this.props.videoId}`}>
          <img
            alt="demo video"
            src={imgUrl}
            onClick={this.handleClick} />
        </Link>
      </div>
    );
  }
}

VideoCard.propTypes = {
  videoId: PropTypes.string.isRequired,
}
