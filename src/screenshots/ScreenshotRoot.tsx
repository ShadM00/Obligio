import React, {useEffect, useState} from 'react';
import {LogBox, Pressable, StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import {AUTO_ADVANCE_MS, CAPTURE_FRAME, CAPTURE_LOCALE} from './config';
import {locales} from '../i18n';
import {useAppTheme} from '../theme';
import {CalendarScreen, DocumentsScreen, Home, ScreenScroll} from '../screens';
import {Paywall, RequirementDetail, TemplatePicker} from '../modals';
import {screenshotPackages, screenshotRequirements, screenshotTemplates, spanishScreenshotRequirements} from './fixtures';

/**
 * A gallery of the real screens against fixture data, for capturing App Store
 * and Play listing images plus the per-product review screenshot Apple
 * requires.
 *
 * The two modal frames render over the dashboard, because that is where a
 * user meets them. Presented against an empty root instead, their dimmed
 * backdrop photographs as a grey void across the top of the screenshot.
 *
 * It renders the actual components, so what is captured is what ships. Tap
 * anywhere to advance; the frame counter is only visible during capture and
 * never reaches a release build, since index.js gates this behind `__DEV__`.
 */

const LOCALE = CAPTURE_LOCALE;
const requirements = LOCALE === 'es-US' ? spanishScreenshotRequirements : screenshotRequirements;

// The paywall is captured last and deliberately: App Store Connect wants a
// review screenshot for each in-app purchase, and that one shows the prices.
// It is not a listing screenshot -- guideline 2.3.7 keeps price references out
// of those -- so build-store-screenshots.py composes every frame but this one.
const FRAMES = ['dashboard', 'calendar', 'documents', 'suggested', 'detail', 'paywall'] as const;
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

// The dev LogBox toast counts errors as they arrive and repaints each time it
// does, so a capture run sees one frame as several short ones and drops most
// of them. It is also not something that should appear in a store screenshot.
LogBox.ignoreAllLogs(true);

export default function ScreenshotRoot() {
  const [index, setIndex] = useState(0);
  const {s, isDark} = useAppTheme();

  useEffect(() => {
    if (AUTO_ADVANCE_MS <= 0) {
      return;
    }
    // The first frame is held for two steps, not one. It is on screen from
    // first paint rather than from mount, so on a cold bundle load a single
    // step can shrink to almost nothing -- and being the longest frame is
    // also what lets a capture run identify where the cycle starts, instead
    // of assuming the first thing it sees is frame one.
    let interval: ReturnType<typeof setInterval> | undefined;
    const settle = setTimeout(() => {
      interval = setInterval(() => setIndex(i => i + 1), AUTO_ADVANCE_MS);
      setIndex(i => i + 1);
    }, AUTO_ADVANCE_MS * 2);
    return () => {
      clearTimeout(settle);
      clearInterval(interval);
    };
  }, []);

  const copy = locales[LOCALE];
  const frame: Frame = FRAMES[(CAPTURE_FRAME ?? index) % FRAMES.length];
  const noop = () => undefined;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Pressable style={s.safe} onPress={() => setIndex(i => i + 1)}>
          {(frame === 'dashboard' || frame === 'suggested' || frame === 'detail' || frame === 'paywall') && (
            <Chrome title={copy.dashboard}>
              <Home
                copy={copy}
                locale={LOCALE}
                items={requirements}
                onAdd={noop}
                onSelect={noop}
                onBrowseTemplates={noop}
              />
            </Chrome>
          )}
          {frame === 'calendar' && (
            <Chrome title={copy.calendar}>
              <CalendarScreen copy={copy} locale={LOCALE} items={requirements} onSelect={noop} />
            </Chrome>
          )}
          {frame === 'documents' && (
            <Chrome title={copy.documents}>
              <DocumentsScreen copy={copy} locale={LOCALE} items={requirements} onSelect={noop} />
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
          {frame === 'detail' && (
            <RequirementDetail
              item={requirements[0]}
              copy={copy}
              locale={LOCALE}
              onClose={noop}
              onComplete={async () => undefined}
              onAttach={async () => undefined}
              onDelete={async () => undefined}
              onEdit={noop}
              onViewEvidence={async () => undefined}
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
