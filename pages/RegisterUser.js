/*Screen to register the user*/
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import NetInfo from "@react-native-community/netinfo";
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
      let unsubscribeRegister = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribeRegister();
          postRemoteDb(rut, name, mail, hash);
          unsubscribeRegister = null;
        }
      });
    }
  });
}

export default class RegisterUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      mail: '',
    };
  }

  register_user = () => {
    const { rut, name, mail } = this.state;
    const updated = 0;
    const hash = (new Date()).getTime();

    if (!name)
      return alert('Please fill Name');

    if (!mail)
      return alert('Please fill Mail');

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO users (rut, name, mail, updated, hash) VALUES (?,?,?,?,?)',
        [rut, name, mail, updated, hash],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('local done, remote now...');
            postRemoteDb(rut, name, mail, hash);

            Alert.alert(
              'Success',
              'You are Registered Successfully',
              [
                {
                  text: 'Ok',
                  onPress: () =>
                    this.props.navigation.navigate('HomeScreen'),
                },
              ],
              { cancelable: false }
            );
          } else {
            console.log('Local INSERT Error')
            alert('Registration Failed');
          }
        },
        (tx, err) => { alert(tx.message); console.log('Local INSERT Error', tx.message) }
      );
    });
  };

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1, justifyContent: 'space-between' }}>
            <Mytextinput
              placeholder="Enter Rut"
              onChangeText={rut => this.setState({ rut })}
              style={{ padding: 10 }}
              keyboardType="numeric"
            />
            <Mytextinput
              placeholder="Enter Name"
              onChangeText={name => this.setState({ name })}
              style={{ padding: 10 }}
            />
            <Mytextinput
              placeholder="Enter Mail"
              onChangeText={mail => this.setState({ mail })}
              maxLength={10}
              style={{ padding: 10 }}
            />
            <Mybutton
              title="Submit"
              customClick={this.register_user.bind(this)}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    );
  }
}