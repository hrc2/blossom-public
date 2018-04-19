import React from 'react';
import PropTypes from 'prop-types';
import { VideoCard } from "./video_card";

/**
 * A list of VideoCards
 */
export class VideoCollection extends React.PureComponent {
  render() {
    return (
      <div className="videos row">
        {
          Object.keys(this.props.videoData).map(videoId => {
            return <VideoCard
              key={videoId}
              videoId={videoId} />
          })
        }
       </div>
    );
  }
}

VideoCollection.propTypes = {
  videoData: PropTypes.object.isRequired,
}
