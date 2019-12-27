/*Screen to view all the user*/
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { db } from '../App'

export default class ViewAllUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      FlatListItems: [],
    };

    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users', [], (tx, results) => {
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