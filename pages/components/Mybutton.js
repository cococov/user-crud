import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Mybutton = props => {
  return (
    <TouchableOpacity style={styles.button} onPress={props.customClick}>
      <Text style={styles.text}>{props.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    color: '#ffffff',
    padding: 10,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
    borderRadius: 4,
    borderWidth: 0.1,
    borderColor: '#4b4f56'
  },
  text: {
    color: '#4b4f56',
    fontWeight: 'bold',
  },
});

export default Mybutton;