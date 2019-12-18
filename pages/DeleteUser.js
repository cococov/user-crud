import React from 'react';
import { Button, Text, View, Alert } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import { openDatabase } from 'react-native-sqlite-storage';
import NetInfo from "@react-native-community/netinfo";

//Connction to access the pre-populated users.db
var db = openDatabase({ name: 'users.db', createFromLocation: 1 }, () => { console.log('todo bien con la DB local'), () => { console.log('algo anda mal con la DB local') } });

const postRemoteDb = (rut) => {
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      fetch('http://192.168.1.129:3000/deleteUser', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: rut
        }),
      }).then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
        })
        .catch((error) => {
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
        'DELETE FROM  users where rut=?',
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