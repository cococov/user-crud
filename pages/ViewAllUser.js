/*Screen to view all the user*/
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { url, port } from '../config.json'
import { db } from '../App'

export default class ViewAllUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      FlatListItems: [],
    };
    this.tryRemote();
  }

  /**
   * Try to get remote data. If there is not connection, use the local storage data
   */
  tryRemote = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetch(`${url}:${port}/users`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }).then((response) => response.json())
          .then((responseJson) => {
            responseJson.forEach(user => {
              db.transaction((tx) => {
                tx.executeSql(
                  `UPDATE users SET name=?, mail=?, hash=?, updated=1, deleted=0  WHERE rut=?`,
                  [user.name, user.mail, user.hash, user.rut],
                  (tx, results) => {
                    if (results.rowsAffected <= 0) {
                      tx.executeSql(
                        `INSERT INTO users (rut, name, mail, updated, hash, deleted) VALUES (?,?,?,?,?,?)`,
                        [user.rut, user.name, user.mail, 1, user.hash, 0],
                        (tx, results) => {
                          if (results.rowsAffected <= 0) {
                            console.log('Local INSERT error');
                          }
                        },
                        (tx, err) => { alert(tx.message); console.log('Local INSERT error', tx.message) }
                      );
                    }
                  },
                  (tx, err) => { alert(tx.message); console.log('UPDATE Failed', tx.message) }
                );
              });
              console.log(user);
            });
            this.getUsers();
          })
          .catch((error) => {
            console.error(error);
            this.getUsers();
          });
      } else {
        this.getUsers();
      }
    });
  }

  /**
   * Get all users from the local DB
   */
  getUsers = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users WHERE deleted=0', [], (tx, results) => {
        var temp = [];
        for (let i = 0; i < results.rows.length; i++) {
          temp.push(results.rows.item(i));
        }
        this.setState({
          FlatListItems: temp,
        });
      });
    });
  }

  ListViewItemSeparator = () => {
    return (
      <View style={{ height: 0.2, width: '100%', backgroundColor: '#808080' }} />
    );
  };

  render() {
    return (
      <View>
        <FlatList
          data={this.state.FlatListItems}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View key={item.rut} style={{ backgroundColor: 'white', padding: 20 }}>
              <Text>Id: {item.rut}</Text>
              <Text>Name: {item.name}</Text>
              <Text>Mail: {item.mail}</Text>
              <Text>Hash: {item.hash}</Text>
            </View>
          )}
        />
      </View>
    );
  }
}