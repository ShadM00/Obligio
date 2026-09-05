/**
 * @format
 */

import { AppRegistry } from 'react-native';
import React from 'react';
import App from './App';
import { name as appName } from './app.json';
import { ConvexProvider } from 'convex/react';
import { convexClient } from './src/convexClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function Root() {
  return <SafeAreaProvider><ConvexProvider client={convexClient}><App /></ConvexProvider></SafeAreaProvider>;
}

AppRegistry.registerComponent(appName, () => Root);
