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
 * @param {number} deleted 1 -> deleted :: 0 -> no deleted
 */
const postRemoteDb = (rut, name, mail, hash, deleted) => {
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
          hash: hash,
          deleted: deleted
        }),
      }).then((response) => {
        if (response.status === 200) {
          db.transaction((tx) => {
            tx.executeSql(
              `UPDATE users SET updated = 1 WHERE rut = '${rut}'`,
              [],
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  console.log('User updated');
                } else {
                  console.log('Local UPDATE Error');
                  alert('Registration Failed');
                }
              },
              (tx, err) => { alert(tx.message); console.log('Local UPDATE Error', tx.message) }
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
   * Try to get remote data. If there is not connection, use the local DB instead
   */
  tryRemote = () => {
    const { rut } = this.state;
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetch(`${url}:${port}/getUser?rut=${rut}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }).then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.length > 0) {
              db.transaction((tx) => {
                let user = responseJson[0];
                tx.executeSql(
                  `UPDATE users SET name=?, mail=?, hash=?, updated=1, deleted=0 WHERE rut = '${rut}'`,
                  [user.name, user.mail, user.hash],
                  (tx, results) => {
                    if (results.rowsAffected <= 0) {
                      tx.executeSql(
                        `INSERT INTO users (rut, name, mail, updated, hash, deleted) VALUES (?,?,?,?,?,?)`,
                        [rut, user.name, user.mail, 1, user.hash, 0],
                        (tx, results) => {
                          if (results.rowsAffected <= 0) {
                            console.log('Local INSERT error');
                          }
                        },
                        (tx, err) => { alert(tx.message); console.log('local INSERT error', tx.message) }
                      );
                    }
                    this.searchUser();
                  },
                  (tx, err) => { alert(tx.message); console.log('UPDATE Failed', tx.message) }
                );
              });
            } else {
              alert('user not found');
            }
          })
          .catch((error) => {
            console.error(error);
            this.searchUser();
          });
      } else {
        this.searchUser();
      }
    });
  }

  /**
   * Search a user in the local DB
   */
  searchUser = () => {
    const { rut } = this.state;
    console.log(rut);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE rut=? AND deleted=0',
        [rut],
        (tx, results) => {
          let len = results.rows.length;
          if (len > 0) {
            this.setState({
              name: results.rows.item(0).name,
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

  /**
   * Update the local User and after that, try to sync with the remote DB
   */
  updateUser = () => {
    const { rut, name, mail } = this.state;
    const hash = (new Date()).getTime();

    if (!name)
      return alert('Please fill Name');

    if (!mail)
      return alert('Please fill Mail');

    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE users set name=?, mail=?, hash=?, updated=0, deleted=0 where rut=?`,
        [name, mail, hash, rut],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            postRemoteDb(rut, name, mail, hash, 0);
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