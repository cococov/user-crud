import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import NetInfo from '@react-native-community/netinfo';
import { url, port } from '../config.json'
import { db } from '../App'

const postRemoteDb = (rut, name, mail, hash) => {
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      fetch(`${url}:${port}/syncUser`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rut: rut,
          name: name,
          mail: mail,
          hash: hash
        }),
      }).then((response) => response.json())
        .then((responseJson) => {
          db.transaction((tx) => {
            tx.executeSql(
              `UPDATE users SET updated = 1 WHERE rut = '${rut}'`,
              [],
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  console.log(responseJson);
                } else {
                  console.log('Local UPDATE Error');
                  alert('Registration Failed');
                }
              },
              (tx, err) => { alert(tx.message); console.log('Local UPDATE Error', tx.message) }
            );
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      console.log('No connection');
      let unsubscribeUpdate = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribeUpdate();
          postRemoteDb(rut, name, mail, hash);
          unsubscribeUpdate = null;
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
      name: '',
      mail: '',
    };
  }

  searchUser = () => {
    const { input_rut } = this.state;
    console.log(input_rut);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users where rut = ?',
        [input_rut],
        (tx, results) => {
          let len = results.rows.length;
          console.log('len', len);
          if (len > 0) {
            console.log(results.rows.item(0).mail);
            this.setState({
              name: results.rows.item(0).name,
            });
            this.setState({
              mail: results.rows.item(0).mail,
            });
          } else {
            alert('No user found');
            this.setState({
              name: '',
              mail: '',
            });
          }
        }
      );
    });
  };

  updateUser = () => {
    const { input_rut, name, mail } = this.state;
    const hash = (new Date()).getTime();

    if (!name)
      return alert('Please fill Name');

    if (!mail)
      return alert('Please fill Mail');

    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE users set name=?, mail=?, hash=?, updated=0 where rut=?`,
        [name, mail, hash, input_rut],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            postRemoteDb(input_rut, name, mail, hash);
            Alert.alert('Success', 'User updated successfully',
              [
                { text: 'Ok', onPress: () => this.props.navigation.navigate('HomeScreen') },
              ],
              { cancelable: false }
            );
          } else {
            alert('Updation Failed');
          }
        }
      );
    });
  };

  render() {
    const { name, mail } = this.state;
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: 'space-between' }}>
            <Mytextinput
              placeholder="Enter User Rut"
              style={{ padding: 10 }}
              onChangeText={input_rut => this.setState({ input_rut })}
              keyboardType="numeric"
            />
            <Mybutton
              title="Search User"
              customClick={this.searchUser.bind(this)}
            />
            <Mytextinput
              placeholder="Enter Name"
              value={name}
              style={{ padding: 10 }}
              onChangeText={name => this.setState({ name })}
            />
            <Mytextinput
              placeholder="Enter Mail"
              value={mail}
              onChangeText={mail => this.setState({ mail })}
              maxLength={10}
              style={{ padding: 10 }}
            />
            <Mybutton
              title="Update User"
              customClick={this.updateUser.bind(this)}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}