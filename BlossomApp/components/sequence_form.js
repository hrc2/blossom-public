import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Content, Button, Text, Form, Item, Input, Label, Picker } from 'native-base';

export class SequenceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      label: "none",
    };

    this.isValidName = this.isValidName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  isValidName() {
    return this.state.name;
  }

  handleSubmit() {
    this.props.onSubmit(this.state.name, this.state.label);
  }

  renderButtons() {
    const disableSubmit = !this.isValidName() || this.props.isLoading;
    return (
      <View style={styles.buttonsWrapper}>
        <Button light onPress={this.props.onCancel}>
          <Text>Cancel</Text>
        </Button>
        <Button
          disabled={disableSubmit}
          onPress={this.handleSubmit}>
          <Text>Done</Text>
        </Button>
      </View>
    );
  }

  renderClassification() {
    if (!this.props.classification) {
      return null;
    }

    return (
      <Text style={styles.subtitle}>
        We thought it was <Text style={{fontWeight: 'bold'}}>{this.props.classification}</Text>. Were we right?
      </Text>
    );
  }

  render() {
    return (
      <Content>
        <Text style={styles.formHeader}>
          Finish making your gesture!
        </Text>
        {this.renderClassification()}
        <Form style={styles.form}>
          <Item
            stackedLabel
            error={!this.isValidName()} >
            <Label>Name</Label>
            <Input
              onChangeText={ text => {this.setState({name: text})} }
              value={'' + this.state.name}
              autoCapitalize="none" />
          </Item>
          <Content style={styles.labels}>
            <Label style={styles.labelsText} >
              Label (optional)
            </Label>
            <Picker
              mode="dropdown"
              selectedValue={this.state.label}
              onValueChange={label => this.setState({label})} >
              <Picker.Item label="None" value="none" />
              <Picker.Item label="Happy" value="happy" />
              <Picker.Item label="Sad" value="sad" />
              <Picker.Item label="Anger" value="anger" />
              <Picker.Item label="Fear" value="fear" />
            </Picker>
          </Content>
        </Form>
        {this.renderButtons()}
      </Content>
    );
  }
}

SequenceForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  classification: PropTypes.string,
};

const styles = StyleSheet.create({
  buttonsWrapper: {
    flex: 1,
    flexDirection:'row',
    justifyContent: 'space-between',
    margin: 10,
    marginTop: 40,
  },
  formHeader: {
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
    paddingBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    paddingBottom: 20,
  },
  labels: {
    paddingTop: 20,
    paddingLeft: 15,
  },
  labelsText: {
    fontSize: 15,
    color: "#666666",
  },
  form: {
    flex: 1,
  }
});
