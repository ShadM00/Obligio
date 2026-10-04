import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {recordError} from './analytics';
import {locales} from './i18n';
import {useAppTheme} from './theme';

/**
 * Last line of defence for a render error.
 *
 * Without one, a thrown error unmounts the whole tree and the owner is left
 * looking at a blank screen with no way forward — and since the app carries no
 * crash reporting, the first anyone would hear of it is a one-star review.
 *
 * It reports to Crashlytics. That used to be deliberately not so, because a
 * crash SDK changes what the App Privacy label and Play Data Safety answers
 * have to say; that decision was made openly when Firebase was added, and the
 * answers are in docs/analytics-and-privacy.md. A render error caught here
 * never reaches Crashlytics' global handler, so without this call the most
 * common kind of JavaScript crash would be invisible.
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
    console.error('Unhandled render error', error);
    recordError(error, 'render');
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
