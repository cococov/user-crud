import React from 'react';
import { Text, View } from 'react-native';
import Mytextinput from './components/Mytextinput';
import Mybutton from './components/Mybutton';
import { openDatabase } from 'react-native-sqlite-storage';
//Connction to access the pre-populated users.db
var db = openDatabase({ name: 'users.db', createFromLocation: 1 }, () => { console.log('todo bien con la DB local'), () => { console.log('algo anda mal con la DB local') } });

export default class ViewUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      input_rut: '',
      userData: '',
    };
  }

  searchUser = () => {
    const { input_rut } = this.state;
    console.log(this.state.input_rut);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users where rut = ?',
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
          placeholder="Enter User Rut"
          onChangeText={input_rut => this.setState({ input_rut })}
          style={{ padding: 10 }}
        />
        <Mybutton
          title="Search User"
          customClick={this.searchUser.bind(this)}
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