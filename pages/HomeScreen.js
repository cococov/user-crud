/*Home Screen With buttons to navigate to different options*/
import React from 'react';
import { View } from 'react-native';
import Mybutton from './components/Mybutton';
import Mytext from './components/Mytext';
import { openDatabase } from 'react-native-sqlite-storage';
import NetInfo from "@react-native-community/netinfo";

//Connction to access the pre-populated users.db
var db = openDatabase({ name: 'users.db', createFromLocation: 1 }, () => { console.log('todo bien con la DB local'), () => { console.log('algo anda mal con la DB local') } });

const postRemoteDb = (data, path, table, key) => {
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      fetch(`http://192.168.1.129:3000/${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response) => response.json())
        .then((responseJson) => {
          db.transaction((tx) => {
            tx.executeSql(
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
            );
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      console.log('No connection');
      unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribe();
          postRemoteDb(rut, name, mail, hash);
        }
      });
    }
  });
}

const updateExternalDb = () => {
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT name 
           FROM sqlite_master 
           WHERE type = 'table' 
             AND name NOT LIKE 'sqlite_%' 
             AND name != 'android_metadata'`,
          [],
          (tx, tables) => {
            console.log('Rows: ', tables.rows.length);
            for (i = 0; i < tables.rows.length; i++) {
              console.log('Table: ', tables.rows.item(i).name);
              let table = tables.rows.item(i).name;
              db.transaction((tx) => {
                tx.executeSql(
                  `SELECT * 
                   FROM ${table} 
                   WHERE updated = 0`,
                  [],
                  (tx, results) => {
                    for (i = 0; i < results.rows.length; i++) {
                      let item = results.rows.item(i);
                      let path = '';
                      let key = item['id'] ? 'id' : 'rut';
                      switch (table) {
                        case 'users':
                          path = 'setUser';
                          break;
                        case 'areas':
                          path = 'setArea';
                          break;
                      }
                      console.log('Results: ', item[key]);
                      postRemoteDb(item, path, table, key);
                    }
                  },
                  (tx, err) => { alert(tx.message); console.log('Error getting the data to update the remote DB', tx.message) }
                );
              });
            }
            alert('Data updated !');
          },
          (tx, err) => { alert(tx.message); console.log('Error getting the data to update the remote DB', tx.message) }
        );
      });
    } else {
      console.log('No connection');
      unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          unsubscribe();
          updateExternalDb();
        }
      });
    }
  });
}

export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    updateExternalDb();
  }

  render() {
    const { navigation } = this.props;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          flexDirection: 'column',
        }}>
        <Mytext text="SQLite & MySQL Example" />
        <Mybutton
          title="Register User"
          customClick={() => navigation.navigate('Register')}
        />
        <Mybutton
          title="Update User"
          customClick={() => navigation.navigate('Update')}
        />
        <Mybutton
          title="View User"
          customClick={() => navigation.navigate('View')}
        />
        <Mybutton
          title="View All Users"
          customClick={() => navigation.navigate('ViewAll')}
        />
        <Mybutton
          title="Delete User"
          customClick={() => navigation.navigate('Delete')}
        />
      </View>
    );
  }
}