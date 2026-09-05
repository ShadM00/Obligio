import React, {useState} from 'react';
import {Pressable, StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import {locales, type Locale} from '../i18n';
import {useAppTheme} from '../theme';
import {CalendarScreen, DocumentsScreen, Home, ScreenScroll} from '../screens';
import {Paywall, TemplatePicker} from '../modals';
import {screenshotPackages, screenshotRequirements, screenshotTemplates} from './fixtures';

/**
 * A gallery of the real screens against fixture data, for capturing App Store
 * and Play listing images plus the per-product review screenshot Apple
 * requires.
 *
 * It renders the actual components, so what is captured is what ships. Tap
 * anywhere to advance; the frame counter is only visible during capture and
 * never reaches a release build, since index.js gates this behind `__DEV__`.
 */

const LOCALE: Locale = 'en-US';

const FRAMES = ['dashboard', 'calendar', 'documents', 'suggested', 'paywall'] as const;
type Frame = (typeof FRAMES)[number];

function Chrome({title, children}: {title: string; children: React.ReactNode}) {
  const {s} = useAppTheme();
  const copy = locales[LOCALE];
  return (
    <ScreenScroll>
      <View style={s.top}>
        <View>
          <Text style={s.eyebrow}>{copy.appName}</Text>
          <Text style={s.title}>{title}</Text>
        </View>
      </View>
      {children}
    </ScreenScroll>
  );
}

export default function ScreenshotRoot() {
  const [index, setIndex] = useState(0);
  const {s, isDark} = useAppTheme();
  const copy = locales[LOCALE];
  const frame: Frame = FRAMES[index % FRAMES.length];
  const noop = () => undefined;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Pressable style={s.safe} onPress={() => setIndex(i => i + 1)}>
          {frame === 'dashboard' && (
            <Chrome title={copy.dashboard}>
              <Home
                copy={copy}
                locale={LOCALE}
                items={screenshotRequirements}
                onAdd={noop}
                onSelect={noop}
                onBrowseTemplates={noop}
              />
            </Chrome>
          )}
          {frame === 'calendar' && (
            <Chrome title={copy.calendar}>
              <CalendarScreen copy={copy} locale={LOCALE} items={screenshotRequirements} onSelect={noop} />
            </Chrome>
          )}
          {frame === 'documents' && (
            <Chrome title={copy.documents}>
              <DocumentsScreen copy={copy} locale={LOCALE} items={screenshotRequirements} onSelect={noop} />
            </Chrome>
          )}
          {frame === 'suggested' && (
            <TemplatePicker
              copy={copy}
              locale={LOCALE}
              templates={screenshotTemplates}
              onClose={noop}
              onAdopt={async () => undefined}
            />
          )}
          {frame === 'paywall' && (
            <Paywall copy={copy} onClose={noop} packagesOverride={screenshotPackages} />
          )}
        </Pressable>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
