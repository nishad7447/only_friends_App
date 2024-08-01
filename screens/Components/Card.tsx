import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  variant?: string;
  extra?: string;
  style?: ViewStyle; // Allow additional styles to be passed
  children: any
}

const Card: React.FC<CardProps> = ({
  variant,
  extra,
  children,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    zIndex: 5, // React Native uses `zIndex` for layering
    position: 'relative', // This is similar to `relative` in web CSS
    flexDirection: 'column', // Flexbox layout similar to web
    borderRadius: 20, // Corresponds to `rounded-[20px]`
    backgroundColor: 'white', // Default background color
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 5, // Shadow radius
    elevation: 5, // Android shadow support
    padding: 16, // Add padding for content spacing
  },
});

export default Card;
