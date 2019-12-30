import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import NetInfo from '@react-native-community/netinfo';
import { url, port } from '../config.json'
import { db } from '../App'

/**
 * Send the user's data to the backend for storage it.
 * @param {string} rut Rut of the user.
 * @param {string} name Name of the user.
 * @param {string} mail E-mail of the user.
 * @param {number} hash Hash (epoch meanwhile) of the change.
 */
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
      rut: '',
      name: '',
      mail: '',
    };
  }

  /**
   * @todo
   */
  tryRemote = () => {
    const { rut } = this.state;
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetch(`${url}:${port}/getUser`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rut: rut }),
        }).then((response) => response.json())
          .then((responseJson) => {
            db.transaction((tx) => {
              console.log('prueba -> ', responseJson);
              /* tx.executeSql(
                `UPDATE ${table} SET updated = 1 WHERE ${key} = '${data[key]}'`,
                [],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('Users table Updated');
                  } else {
                    console.log('UPDATE Failed');
                    alert('Registration Failed');
                  }
                },
                (tx, err) => { alert(tx.message); console.log('UPDATE Failed', tx.message) }
              ); */
              this.searchUser();
            });
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        this.searchUser();
      }
    });
  }

  /**
   * Search data of the user on the DB, trying to get it from the remote DB first.
   */
  searchUser = () => {
    const { rut } = this.state;
    console.log(rut);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users where rut = ?',
        [rut],
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
    const { rut, name, mail } = this.state;
    const hash = (new Date()).getTime();

    if (!name)
      return alert('Please fill Name');

    if (!mail)
      return alert('Please fill Mail');

    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE users set name=?, mail=?, hash=?, updated=0 where rut=?`,
        [name, mail, hash, rut],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            postRemoteDb(rut, name, mail, hash);
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
              onChangeText={rut => this.setState({ rut })}
              keyboardType="numeric"
            />
            <Mybutton
              title="Search User"
              customClick={this.tryRemote.bind(this)}
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