import React from 'react';
import { View, YellowBox, ScrollView, KeyboardAvoidingView, Alert, } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import { openDatabase } from 'react-native-sqlite-storage';
//Connction to access the pre-populated users.db
var db = openDatabase({ name: 'users.db', createFromLocation: 1 }, () => { console.log('todo bien con la DB local'), () => { console.log('algo anda mal con la DB local') } });

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

    if (name) {
      if (mail) {
        db.transaction((tx) => {
          tx.executeSql(
            'UPDATE user set name=?, mail=? where rut=?',
            [name, mail, input_rut],
            (tx, results) => {
              console.log('Results', results.rowsAffected);
              if (results.rowsAffected > 0) {
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
      } else {
        alert('Please fill Contact Number');
      }
    } else {
      alert('Please fill Name');
    }
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