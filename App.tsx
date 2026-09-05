import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useMutation, useQuery} from 'convex/react';
import {pick, types} from '@react-native-documents/picker';

import {api} from './convex/_generated/api';
import {locales, type Locale} from './src/i18n';
import {s} from './src/theme';
import {
  CalendarScreen,
  DocumentsScreen,
  ErrorBanner,
  Home,
  ScreenScroll,
  SettingsScreen,
  Welcome,
} from './src/screens';
import {AddRequirement, Paywall, RequirementDetail} from './src/modals';
import {SAMPLE_REQUIREMENTS, type NewRequirement, type Requirement} from './src/types';
import {notificationsAllowed, prepareNotifications, scheduleReminderForDueDate} from './src/notifications';
import {uploadPickedDocument} from './src/documentUpload';
import {isBillingAvailable} from './src/billing';

type Tab = 'home' | 'calendar' | 'documents' | 'settings';

const TABS: {key: Tab; icon: string; label: string}[] = [
  {key: 'home', icon: '⌂', label: 'Home'},
  {key: 'calendar', icon: '□', label: 'Calendar'},
  {key: 'documents', icon: '▣', label: 'Docs'},
  {key: 'settings', icon: '⚙', label: 'Settings'},
];

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('en-US');
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Requirement | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const copy = useMemo(() => locales[locale], [locale]);

  const business = useQuery(api.businesses.getByOwner, {});
  const liveRequirements = useQuery(api.requirements.list, business ? {businessId: business._id} : 'skip');

  const createBusiness = useMutation(api.businesses.create);
  const createRequirement = useMutation(api.requirementsMutations.create);
  const updateStatus = useMutation(api.requirementsMutations.updateStatus);
  const removeRequirement = useMutation(api.requirementsMutations.remove);
  const completeAndScheduleNext = useMutation(api.recurrence.completeAndScheduleNext);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const attachDocument = useMutation(api.documents.attach);

  useEffect(() => {
    notificationsAllowed()
      .then(setNotificationsOn)
      .catch(() => setNotificationsOn(false));
  }, []);

  // Requirements come from Convex once a business is signed in. The sample rows
  // are only ever shown to an unauthenticated visitor, and are labelled as such.
  const usingSampleData = business === null || liveRequirements === undefined;
  const items: Requirement[] = usingSampleData ? SAMPLE_REQUIREMENTS : liveRequirements;

  // Keep the open detail sheet in step with the server after a mutation.
  useEffect(() => {
    if (!selected?._id) return;
    const fresh = items.find(item => item._id === selected._id);
    if (fresh !== selected) setSelected(fresh ?? null);
  }, [items, selected]);

  const startOnboarding = useCallback(async () => {
    setOnboardingBusy(true);
    setOnboardingError(null);
    try {
      if (!business) {
        await createBusiness({name: 'My business', country: 'US', region: '', industry: 'General'});
      }
      setOnboarded(true);
    } catch (error) {
      setOnboardingError(message(error));
    } finally {
      setOnboardingBusy(false);
    }
  }, [business, createBusiness]);

  const saveRequirement = useCallback(
    async (item: NewRequirement) => {
      if (!business) throw new Error(copy.signInRequired);
      await createRequirement({businessId: business._id, ...item});
      // A missed reminder should never fail the save the user just made.
      try {
        await scheduleReminderForDueDate(item.title, item.dueDate);
      } catch {
        // Reminder scheduling is best-effort.
      }
      setAdding(false);
    },
    [business, copy.signInRequired, createRequirement],
  );

  const completeRequirement = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      await completeAndScheduleNext({requirementId: item._id});
    },
    [completeAndScheduleNext],
  );

  const deleteRequirement = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      await removeRequirement({requirementId: item._id});
      setSelected(null);
    },
    [removeRequirement],
  );

  const attachEvidence = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      let picked;
      try {
        [picked] = await pick({type: [types.allFiles]});
      } catch {
        return; // The picker throws on cancellation; that is not an error.
      }
      if (!picked) return;
      const uploadUrl = await generateUploadUrl({});
      const storageId = await uploadPickedDocument(uploadUrl, picked);
      await attachDocument({requirementId: item._id, documentStorageId: storageId});
    },
    [attachDocument, generateUploadUrl],
  );

  const enableNotifications = useCallback(async () => {
    setActionError(null);
    try {
      await prepareNotifications();
      setNotificationsOn(await notificationsAllowed());
    } catch (error) {
      setActionError(message(error));
    }
  }, []);

  const markStatusCurrent = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      await updateStatus({requirementId: item._id, status: 'current'});
    },
    [updateStatus],
  );

  if (!onboarded) {
    return <Welcome copy={copy} onStart={startOnboarding} busy={onboardingBusy} error={onboardingError} />;
  }

  const title =
    tab === 'home' ? copy.dashboard : tab === 'calendar' ? copy.calendar : tab === 'documents' ? copy.documents : copy.settings;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <ScreenScroll>
        <View style={s.top}>
          <View>
            <Text style={s.eyebrow}>{copy.appName}</Text>
            <Text style={s.title}>{title}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Change language"
            style={s.locale}
            onPress={() => setLocale(locale === 'en-US' ? 'en-GB' : 'en-US')}>
            <Text style={s.localeText}>{locale === 'en-US' ? 'US' : 'UK'}</Text>
          </TouchableOpacity>
        </View>

        {usingSampleData && (
          <View style={s.banner}>
            <Text style={s.bannerText}>{copy.sampleData}</Text>
          </View>
        )}
        {actionError && (
          <ErrorBanner message={actionError} onRetry={() => setActionError(null)} retryLabel={copy.close} />
        )}

        {tab === 'home' && (
          <Home copy={copy} locale={locale} items={items} onAdd={() => setAdding(true)} onSelect={setSelected} />
        )}
        {tab === 'calendar' && <CalendarScreen copy={copy} locale={locale} items={items} onSelect={setSelected} />}
        {tab === 'documents' && <DocumentsScreen copy={copy} locale={locale} items={items} onSelect={setSelected} />}
        {tab === 'settings' && (
          <SettingsScreen
            onSubscribe={() => setPaywall(true)}
            onEnableNotifications={enableNotifications}
            notificationsEnabled={notificationsOn}
            billingAvailable={isBillingAvailable()}
          />
        )}
      </ScreenScroll>

      {adding && <AddRequirement copy={copy} locale={locale} onClose={() => setAdding(false)} onSave={saveRequirement} />}
      {selected && (
        <RequirementDetail
          item={selected}
          copy={copy}
          locale={locale}
          onClose={() => setSelected(null)}
          onComplete={selected.recurrence ? completeRequirement : markStatusCurrent}
          onAttach={attachEvidence}
          onDelete={deleteRequirement}
        />
      )}
      {paywall && <Paywall copy={copy} onClose={() => setPaywall(false)} />}

      <View style={s.nav}>
        {TABS.map(({key, icon, label}) => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{selected: tab === key}}
            key={key}
            style={s.navItem}
            onPress={() => setTab(key)}>
            <Text style={[s.navIcon, tab === key && s.navActive]}>{icon}</Text>
            <Text style={[s.navLabel, tab === key && s.navActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
