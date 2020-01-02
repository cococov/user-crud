import React from 'react';
import { Text, View } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import NetInfo from '@react-native-community/netinfo';
import { url, port } from '../config.json'
import { db } from '../App'

export default class ViewUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input_rut: '',
      userData: '',
    };
  }

  /**
   * Try to get remote data. If there is not connection, use the local DB instead
   */
  tryRemote = () => {
    const { input_rut } = this.state;
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetch(`${url}:${port}/getUser?rut=${input_rut}`, {
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
                  `UPDATE users SET name=?, mail=?, hash=?, updated=?, deleted=?  WHERE rut=?`,
                  [user.name, user.mail, user.hash, 1, 0, input_rut],
                  (tx, results) => {
                    if (results.rowsAffected <= 0) {
                      tx.executeSql(
                        `INSERT INTO users (rut, name, mail, updated, hash, deleted) VALUES (?,?,?,?,?,?)`,
                        [input_rut, user.name, user.mail, 1, user.hash, 0],
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
    const { input_rut } = this.state;
    console.log(this.state.input_rut);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users where rut = ? AND deleted=0',
        [input_rut],
        (tx, results) => {
          var len = results.rows.length;
          console.log('len', len);
          if (len > 0) {
            this.setState({
              userData: results.rows.item(0),
            });
          } else {
            alert('No user found');
            this.setState({
              userData: '',
            });
          }
        }
      );
    });
  };

  render() {
    const { rut, name, mail, hash } = this.state.userData;
    return (
      <View>
        <Mytextinput
          placeholder="Enter the User's Rut"
          onChangeText={input_rut => this.setState({ input_rut })}
          style={{ padding: 10 }}
        />
        <Mybutton
          title="Search User"
          customClick={this.tryRemote.bind(this)}
        />
        <View style={{ marginLeft: 35, marginRight: 35, marginTop: 10 }}>
          <Text>User Rut: {rut}</Text>
          <Text>User Name: {name}</Text>
          <Text>User Mail: {mail}</Text>
          <Text>User Hash: {hash}</Text>
        </View>
      </View>
    );
  }
}