import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  rightButtonText?: string;
  rightButtonDisabled?: boolean;
  onBackPress?: () => void;
  onRightButtonPress?: () => void;
  style?: any;
  contentStyle?: any;
  headerStyle?: any;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = true,
  rightButtonText,
  rightButtonDisabled = false,
  onBackPress,
  onRightButtonPress,
  style,
  contentStyle,
  headerStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea}>
        {title && (
          <Header
            title={title}
            showBackButton={showBackButton}
            rightButtonText={rightButtonText}
            rightButtonDisabled={rightButtonDisabled}
            onBackPress={onBackPress}
            onRightButtonPress={onRightButtonPress}
            style={headerStyle}
          />
        )}
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 8,
    paddingTop: 0,
  },
});

export default Layout; 