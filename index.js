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
import { ErrorBoundary } from './src/ErrorBoundary';

function Root() {
  // The boundary sits outside the providers so it survives a failure in
  // anything they render, including the providers' own children.
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ConvexProvider client={convexClient}>
          <App />
        </ConvexProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

// The screenshot harness renders real screens against fixture data for store
// listings and the App Store per-product review screenshot. It lives behind
// __DEV__, so Metro strips it and its fixtures from release bundles.
let Entry = Root;
if (__DEV__ && require('./src/screenshots/config').SCREENSHOT_MODE) {
  Entry = require('./src/screenshots/ScreenshotRoot').default;
}

AppRegistry.registerComponent(appName, () => Entry);
