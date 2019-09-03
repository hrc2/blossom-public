import React from 'react';
import PropTypes from 'prop-types';
import { GestureButton } from "./gesture_button";

/**
 * A list of GestureButtons
 */
export class GestureCollection extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sequences: [],
    };
  }

  componentWillMount() {
    fetch(`/sequences`)
      .then(response => {
        response.json().then(data => {
          this.setState({sequences: data})
        });
      })
      .catch(() => {
        console.log("error getting seqs");
      });
  }

  render() {
    const filteredSeqs = this.state.sequences.filter(seq => seq.toString().toLowerCase().includes(this.props.filter) );

    return (
      <div className="sequence-list">
        {
          filteredSeqs.map(seq => {
            return <GestureButton key={seq[0]} name={seq[0]} />
          })
        }
     </div>
    );
  }
}

GestureCollection.propTypes = {
  filter: PropTypes.string,
}

GestureCollection.defaultProps = {
  filter: "",
};
