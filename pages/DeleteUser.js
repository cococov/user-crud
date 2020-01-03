import React from 'react';
import { View, Alert } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import NetInfo from "@react-native-community/netinfo";
import { url, port } from '../config.json'
import { db } from '../App'

const postRemoteDb = (rut) => {
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      fetch(`${url}:${port}/deleteUser`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: rut
        }),
      }).then((response) => {
        if (response.status === 200) {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM users WHERE rut=?',
              [rut], (tx, results) => { }
            );
          });
        }
        return response.json();
      }).then((responseJson) => {
        console.log(responseJson);
      }).catch((error) => {
        console.error(error);
      });
    } else {
      console.log('No connection');
      unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribe();
          postRemoteDb(rut);
        }
      });
    }
  });
}

export default class UpdateUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input_rut: '',
    };
  }

  deleteUser = () => {
    const { input_rut } = this.state;

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE users SET deleted=1, updated=0 where rut=?',
        [input_rut],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            postRemoteDb(input_rut);
            Alert.alert(
              'Success',
              'User deleted successfully',
              [
                {
                  text: 'Ok',
                  onPress: () => this.props.navigation.navigate('HomeScreen'),
                },
              ],
              { cancelable: false }
            );
          } else {
            alert('Please insert a valid Rut');
          }
        }
      );
    });
  };

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <Mytextinput
          placeholder="Enter Rut"
          onChangeText={input_rut => this.setState({ input_rut })}
          style={{ padding: 10 }}
        />
        <Mybutton
          title="Delete User"
          customClick={this.deleteUser.bind(this)}
        />
      </View>
    );
  }
}