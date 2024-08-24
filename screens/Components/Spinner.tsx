import React, {useContext} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {GlobalState} from '../Context/GlobalState';

const Spinner = () => {
  const {darkMode} = useContext(GlobalState);
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: darkMode ? '#1B2559' : '#EBF1F7'},
      ]}>
      <ActivityIndicator size="large" color={darkMode ? '#fff' : '#1B2559'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Spinner;
