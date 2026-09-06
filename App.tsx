import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useConvex, useMutation, useQuery} from 'convex/react';
import {pick, types} from '@react-native-documents/picker';

import {api} from './convex/_generated/api';
import {locales, type Locale} from './src/i18n';
import {useAppTheme} from './src/theme';
import {
  CalendarScreen,
  DocumentsScreen,
  ErrorBanner,
  Home,
  Onboarding,
  ScreenScroll,
  SettingsScreen,
  SignIn,
} from './src/screens';
import {AddRequirement, Paywall, RequirementDetail, TemplatePicker} from './src/modals';
import {SAMPLE_REQUIREMENTS, type NewRequirement, type Requirement, type RuleTemplate} from './src/types';
import {
  cancelReminderForRequirement,
  notificationsAllowed,
  prepareNotifications,
  scheduleReminderForDueDate,
} from './src/notifications';
import {uploadPickedDocument} from './src/documentUpload';
import {isBillingAvailable} from './src/billing';
import {canAddRequirement, FREE_REQUIREMENT_LIMIT, useSubscription} from './src/subscription';
import {useSession} from './src/session';
import type {Country} from './src/jurisdictions';

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
  const {s, isDark} = useAppTheme();
  const [locale, setLocale] = useState<Locale>('en-US');
  const [tab, setTab] = useState<Tab>('home');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Requirement | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [editing, setEditing] = useState<Requirement | null>(null);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const session = useSession();
  const subscription = useSubscription();
  const [actionError, setActionError] = useState<string | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(false);

  const copy = useMemo(() => locales[locale], [locale]);

  const business = useQuery(api.businesses.getByOwner, {});
  const liveRequirements = useQuery(api.requirements.list, business ? {businessId: business._id} : 'skip');

  const templates = useQuery(
    api.rules.listTemplates,
    business ? {country: business.country, region: business.region, industry: business.industry} : 'skip',
  );

  const createBusiness = useMutation(api.businesses.create);
  const createRequirement = useMutation(api.requirementsMutations.create);
  const updateStatus = useMutation(api.requirementsMutations.updateStatus);
  const removeRequirement = useMutation(api.requirementsMutations.remove);
  const updateRequirement = useMutation(api.requirementsMutations.update);
  const completeAndScheduleNext = useMutation(api.recurrence.completeAndScheduleNext);
  const createFromTemplate = useMutation(api.requirementsMutations.createFromTemplate);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const attachDocument = useMutation(api.documents.attach);
  const convex = useConvex();

  useEffect(() => {
    notificationsAllowed()
      .then(setNotificationsOn)
      .catch(() => setNotificationsOn(false));
  }, []);

  // Requirements come from Convex once a business is signed in. The sample rows
  // are only ever shown to an unauthenticated visitor, and are labelled as such.
  // Sample rows only ever appear to a visitor this build cannot authenticate.
  // A build with no native auth module cannot ever sign in, so walling it
  // behind a sign-in button it can never satisfy would leave nothing to look
  // at. It falls through to a clearly-labelled sample view instead. Every
  // sample row has a null id, so each action stays disabled and nothing can be
  // mistaken for real data.
  const previewOnly = session.status === 'unavailable';

  const usingSampleData = previewOnly || !business || liveRequirements === undefined;
  const items: Requirement[] = usingSampleData ? SAMPLE_REQUIREMENTS : liveRequirements;

  // Keep the open detail sheet in step with the server after a mutation.
  useEffect(() => {
    if (!selected?._id) return;
    const fresh = items.find(item => item._id === selected._id);
    if (fresh !== selected) setSelected(fresh ?? null);
  }, [items, selected]);

  const createProfile = useCallback(
    async (profile: {name: string; country: Country; region: string; industry: string}) => {
      setOnboardingBusy(true);
      setOnboardingError(null);
      try {
        await createBusiness(profile);
      } catch (error) {
        setOnboardingError(message(error));
      } finally {
        setOnboardingBusy(false);
      }
    },
    [createBusiness],
  );

  const saveRequirement = useCallback(
    async (item: NewRequirement) => {
      if (!business) throw new Error(copy.signInRequired);
      const requirementId = await createRequirement({businessId: business._id, ...item});
      // A missed reminder should never fail the save the user just made.
      try {
        await scheduleReminderForDueDate(item.title, item.dueDate, requirementId);
      } catch {
        // Reminder scheduling is best-effort.
      }
      setAdding(false);
    },
    [business, copy.signInRequired, createRequirement],
  );

  const adoptTemplate = useCallback(
    async (rule: RuleTemplate, dueDate: string) => {
      if (!business) throw new Error(copy.signInRequired);
      const requirementId = await createFromTemplate({businessId: business._id, ruleId: rule._id, dueDate});
      try {
        await scheduleReminderForDueDate(rule.title, dueDate, requirementId);
      } catch {
        // Reminder scheduling is best-effort.
      }
    },
    [business, copy.signInRequired, createFromTemplate],
  );

  const completeRequirement = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      const nextId = await completeAndScheduleNext({requirementId: item._id});
      await cancelReminderForRequirement(item._id);
      if (nextId && item.recurrence) {
        const next = await convex.query(api.requirements.list, {businessId: business!._id});
        const created = next.find(row => row._id === nextId);
        if (created) {
          try {
            await scheduleReminderForDueDate(created.title, created.dueDate, nextId);
          } catch {
            // Reminder scheduling is best-effort.
          }
        }
      }
    },
    [business, completeAndScheduleNext, convex],
  );

  const saveEdit = useCallback(
    async (item: NewRequirement) => {
      if (!editing?._id) return;
      await updateRequirement({
        requirementId: editing._id,
        title: item.title,
        category: item.category,
        dueDate: item.dueDate,
        recurrence: item.recurrence,
      });
      // Re-arm against the new date; a moved deadline must not keep the old one.
      try {
        await scheduleReminderForDueDate(item.title, item.dueDate, editing._id);
      } catch {
        // Reminder scheduling is best-effort.
      }
      setEditing(null);
      setSelected(null);
    },
    [editing, updateRequirement],
  );

  const viewEvidence = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      const url = await convex.query(api.documents.getEvidenceUrl, {requirementId: item._id});
      if (!url) throw new Error(copy.noEvidence);
      const opened = await Linking.canOpenURL(url);
      if (!opened) throw new Error('No app on this device can open that document.');
      await Linking.openURL(url);
    },
    [convex, copy.noEvidence],
  );

  const deleteRequirement = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      await removeRequirement({requirementId: item._id});
      // Otherwise the reminder for a deleted obligation still fires.
      await cancelReminderForRequirement(item._id);
      setSelected(null);
    },
    [removeRequirement],
  );

  const attachEvidence = useCallback(
    async (item: Requirement) => {
      if (!item._id) return;
      if (!subscription.isPlus) {
        setPaywall(true);
        throw new Error(copy.evidenceIsPlus);
      }
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
    [attachDocument, copy.evidenceIsPlus, generateUploadUrl, subscription.isPlus],
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

  if (!previewOnly && session.status !== 'signed-in') {
    return (
      <SignIn
        copy={copy}
        status={session.status}
        onSignIn={() => {
          session.signIn();
        }}
        error={session.error}
      />
    );
  }

  // Signed in, but the owner has not created their business yet. `undefined`
  // means the query is still loading, which is not the same as "no business".
  if (!previewOnly && business === null) {
    return (
      <Onboarding
        copy={copy}
        onCreate={createProfile}
        busy={onboardingBusy}
        error={onboardingError}
        onSignOut={() => {
          session.signOut();
        }}
      />
    );
  }

  const title =
    tab === 'home' ? copy.dashboard : tab === 'calendar' ? copy.calendar : tab === 'documents' ? copy.documents : copy.settings;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
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
        {!subscription.isPlus && !usingSampleData && items.length >= FREE_REQUIREMENT_LIMIT && (
          <TouchableOpacity accessibilityRole="button" style={s.banner} onPress={() => setPaywall(true)}>
            <Text style={s.bannerText}>{copy.freeLimitReached(FREE_REQUIREMENT_LIMIT)}</Text>
          </TouchableOpacity>
        )}

        {tab === 'home' && (
          <Home
            copy={copy}
            locale={locale}
            items={items}
            onAdd={() => {
              if (canAddRequirement(subscription.isPlus, items.length)) setAdding(true);
              else setPaywall(true);
            }}
            onSelect={setSelected}
            onBrowseTemplates={business ? () => setTemplatesOpen(true) : undefined}
          />
        )}
        {tab === 'calendar' && <CalendarScreen copy={copy} locale={locale} items={items} onSelect={setSelected} />}
        {tab === 'documents' && <DocumentsScreen copy={copy} locale={locale} items={items} onSelect={setSelected} />}
        {tab === 'settings' && (
          <SettingsScreen
            onSubscribe={() => setPaywall(true)}
            onEnableNotifications={enableNotifications}
            notificationsEnabled={notificationsOn}
            billingAvailable={isBillingAvailable()}
            isPlus={subscription.isPlus}
            onSignOut={() => {
          session.signOut();
        }}
            signOutLabel={copy.signOut}
          />
        )}
      </ScreenScroll>

      {adding && (
        <AddRequirement
          copy={copy}
          locale={locale}
          onClose={() => setAdding(false)}
          onSave={saveRequirement}
          allowRecurrence={subscription.isPlus}
        />
      )}
      {editing && (
        <AddRequirement
          copy={copy}
          locale={locale}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          allowRecurrence={subscription.isPlus}
        />
      )}
      {selected && (
        <RequirementDetail
          item={selected}
          copy={copy}
          locale={locale}
          onClose={() => setSelected(null)}
          onComplete={selected.recurrence ? completeRequirement : markStatusCurrent}
          onAttach={attachEvidence}
          onDelete={deleteRequirement}
          onEdit={setEditing}
          onViewEvidence={viewEvidence}
        />
      )}
      {templatesOpen && (
        <TemplatePicker
          copy={copy}
          locale={locale}
          templates={templates}
          onClose={() => setTemplatesOpen(false)}
          onAdopt={adoptTemplate}
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
