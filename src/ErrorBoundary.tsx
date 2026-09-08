import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {locales} from './i18n';
import {useAppTheme} from './theme';

/**
 * Last line of defence for a render error.
 *
 * Without one, a thrown error unmounts the whole tree and the owner is left
 * looking at a blank screen with no way forward — and since the app carries no
 * crash reporting, the first anyone would hear of it is a one-star review.
 *
 * This deliberately reports nowhere. Adding a crash SDK would change what the
 * App Privacy label and Play data-safety answers have to say, so it is a
 * decision to make openly rather than a side effect of handling errors.
 */

function Fallback({onRetry}: {onRetry: () => void}) {
  const {s} = useAppTheme();
  // Locale is picked in App, which is what just failed, so this cannot read it.
  const copy = locales['en-US'];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.welcome}>
        <Text style={s.eyebrow}>{copy.appName}</Text>
        <Text style={s.title}>{copy.crashTitle}</Text>
        <Text style={s.helperSpaced}>{copy.crashBody}</Text>
        <TouchableOpacity accessibilityRole="button" style={s.primary} onPress={onRetry}>
          <Text style={s.primaryText}>{copy.tryAgain}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

type Props = {children: React.ReactNode};
type State = {failed: boolean};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {failed: false};

  static getDerivedStateFromError(): State {
    return {failed: true};
  }

  componentDidCatch(error: Error) {
    // No reporting endpoint by design; the log is all a developer gets, and it
    // is at least visible in Xcode and logcat when reproducing a report.
    console.error('Unhandled render error', error);
  }

  render() {
    if (this.state.failed) {
      // Remounting the tree is the only recovery available: whatever threw is
      // in a render path, and the state that caused it lives in Convex or in
      // the session, both of which are re-read on mount.
      return <Fallback onRetry={() => this.setState({failed: false})} />;
    }
    return this.props.children;
  }
}
