import {localizeTemplate} from './catalogueTranslations';
import {Linking} from 'react-native';
import {COVERAGE_NOTICE} from './jurisdictions';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {PurchasesPackage} from 'react-native-purchases';
import {useAppTheme} from './theme';

import {formatDisplayDate, parseToIsoDate} from './dates';
import {dueDatePlaceholder, locales, type Locale} from './i18n';
import type {NewRequirement, Requirement, RuleTemplate} from './types';
import {getAvailablePackages, hasPlusEntitlement, isBillingAvailable, purchasePackage, restorePurchases} from './billing';
import {RECURRENCE_OPTIONS, repeatsLabel} from './recurrence';

type Copy = (typeof locales)[Locale];


function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function ModalShell({title, copy, onClose, children}: {title: string; copy: Copy; onClose: () => void; children: React.ReactNode}) {
  const {s} = useAppTheme();
  return (
    <SafeAreaView style={s.modal} edges={['top', 'bottom']}>
      <View style={s.modalCard}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{title}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={onClose}>
            <Text style={s.link}>{copy.close}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={s.modalScroll} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function AddRequirement({
  copy,
  locale,
  onClose,
  onSave,
  initial,
  allowRecurrence,
}: {
  copy: Copy;
  locale: Locale;
  onClose: () => void;
  onSave: (item: NewRequirement) => Promise<void>;
  /** Present when editing an existing requirement rather than creating one. */
  initial?: Requirement;
  /** Recurring obligations are part of Obligio Plus. */
  allowRecurrence?: boolean;
}) {
  const {s} = useAppTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [due, setDue] = useState(initial ? (locale === 'fr-CA' ? initial.dueDate : formatDisplayDate(initial.dueDate, locale)) : '');
  const [recurrence, setRecurrence] = useState<string | undefined>(initial?.recurrence);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dueIso = parseToIsoDate(due, locale);
  const dueTouched = due.trim().length > 0;
  const canSave = title.trim().length > 0 && dueIso !== null && !busy;

  const save = async () => {
    if (!dueIso) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        category: category.trim() || 'Other',
        dueDate: dueIso,
        recurrence,
        status: initial?.status ?? 'upcoming',
      });
    } catch (err) {
      setError(message(err));
      setBusy(false);
    }
  };

  return (
    <ModalShell title={initial ? copy.editRequirement : copy.addRequirement} copy={copy} onClose={onClose}>
      <TextInput style={s.input} placeholder={copy.text('Requirement name')} value={title} onChangeText={setTitle} />
      <TextInput style={s.input} placeholder={copy.text('Category (e.g. Insurance)')} value={category} onChangeText={setCategory} />
      <TextInput
        style={[s.input, dueTouched && !dueIso && s.inputInvalid]}
        placeholder={dueDatePlaceholder(locale)}
        value={due}
        onChangeText={setDue}
        autoCapitalize="none"
      />
      {dueTouched && !dueIso ? (
        <Text style={s.errorText}>{copy.text('Enter a real date, for example')} {locale === 'fr-CA' ? '2026-10-14' : formatDisplayDate('2026-10-14', locale)}</Text>
      ) : (
        dueIso && <Text style={s.muted}>{copy.text('Saving as')} {formatDisplayDate(dueIso, locale)}</Text>
      )}

      <Text style={s.monthHeading}>{copy.text('REPEATS')}</Text>
      <View style={s.row}>
        {RECURRENCE_OPTIONS.map(option => {
          const selected = recurrence === option.value;
          // One-off stays available to everyone; repeating is Plus.
          const locked = allowRecurrence === false && option.value !== undefined;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{selected, disabled: locked}}
              disabled={locked}
              key={option.label}
              style={[s.chip, selected && s.chipSelected, locked && s.primaryDisabled]}
              onPress={() => setRecurrence(option.value)}>
              <Text style={s.chipText}>{copy.text(option.label)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {allowRecurrence === false && <Text style={s.muted}>{copy.recurrenceIsPlus}</Text>}

      {error && <Text style={s.destructiveText}>{error}</Text>}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !canSave}}
        style={[s.primary, !canSave && s.primaryDisabled]}
        disabled={!canSave}
        onPress={save}>
        <Text style={s.primaryText}>{busy ? copy.saving : copy.saveRequirement}</Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

export function RequirementDetail({
  item,
  copy,
  locale,
  onClose,
  onComplete,
  onAttach,
  onDelete,
  onEdit,
  onViewEvidence,
}: {
  item: Requirement;
  copy: Copy;
  locale: Locale;
  onClose: () => void;
  onComplete: (item: Requirement) => Promise<void>;
  onAttach: (item: Requirement) => Promise<void>;
  onDelete: (item: Requirement) => Promise<void>;
  onEdit: (item: Requirement) => void;
  onViewEvidence: (item: Requirement) => Promise<void>;
}) {
  const {s} = useAppTheme();
  const [busy, setBusy] = useState<null | 'complete' | 'attach' | 'delete' | 'evidence'>(null);
  const [error, setError] = useState<string | null>(null);
  const persisted = item._id !== null;

  const run = (kind: 'complete' | 'attach' | 'delete' | 'evidence', action: () => Promise<void>) => async () => {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(null);
    }
  };

  const statusCopy =
    item.status === 'overdue'
      ? copy.text('Overdue — action required')
      : item.status === 'upcoming'
        ? copy.text('Upcoming — prepare to renew')
        : copy.text('Current — monitored');

  return (
    <ModalShell title={copy.text('Obligation detail')} copy={copy} onClose={onClose}>
      <Text style={s.detailTitle}>{item.title}</Text>
      <Text style={[s.detailStatus, item.status === 'current' && s.detailStatusCurrent]}>{statusCopy}</Text>
      <Text style={s.helper}>
        {item.category} · {copy.text('Due')} {formatDisplayDate(item.dueDate, locale)}
        {item.recurrence ? ` · ${copy.text('Repeats')} ${copy.text(repeatsLabel(item.recurrence))}` : ''}
      </Text>

      <View style={s.detailCard}>
        <Text style={s.itemTitle}>{copy.text('Next action')}</Text>
        <Text style={s.helper}>
          {item.status === 'overdue'
            ? copy.text('Resolve this obligation and attach current evidence.')
            : copy.text('Review the requirement before its due date.')}
        </Text>
      </View>

      {!persisted && <Text style={s.muted}>{copy.sampleData}</Text>}
      {error && <Text style={s.destructiveText}>{error}</Text>}

      {item.hasDocument && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{disabled: !persisted || busy !== null}}
          disabled={!persisted || busy !== null}
          style={[s.primary, (!persisted || busy !== null) && s.primaryDisabled]}
          onPress={run('evidence', () => onViewEvidence(item))}>
          <Text style={s.primaryText}>{busy === 'evidence' ? copy.opening : copy.viewEvidence}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        style={[item.hasDocument ? s.secondary : s.primary, (!persisted || busy !== null) && s.primaryDisabled]}
        onPress={run('attach', () => onAttach(item))}>
        <Text style={item.hasDocument ? s.secondaryText : s.primaryText}>
          {busy === 'attach' ? copy.uploading : item.hasDocument ? copy.replaceEvidence : copy.attachEvidence}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        style={[s.secondary, (!persisted || busy !== null) && s.primaryDisabled]}
        onPress={() => onEdit(item)}>
        <Text style={s.secondaryText}>{copy.editRequirement}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        style={[s.secondary, (!persisted || busy !== null) && s.primaryDisabled]}
        onPress={run('complete', () => onComplete(item))}>
        <Text style={s.secondaryText}>
          {busy === 'complete' ? copy.saving : item.recurrence ? copy.markDoneNext : copy.markCurrent}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        onPress={run('delete', () => onDelete(item))}>
        <Text style={s.destructiveText}>{busy === 'delete' ? copy.removing : copy.deleteObligation}</Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

export function Paywall({
  copy,
  onClose,
  packagesOverride,
  isPlus = false,
}: {
  copy: Copy;
  onClose: () => void;
  isPlus?: boolean;
  /** Bypasses the RevenueCat fetch. Used for screenshots and tests. */
  packagesOverride?: PurchasesPackage[];
}) {
  const {s, colors} = useAppTheme();
  const available = isBillingAvailable() || packagesOverride !== undefined;
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(packagesOverride ?? null);
  const [selected, setSelected] = useState<string | null>(packagesOverride?.[0]?.identifier ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const hasAccess = isPlus || activated;

  const load = useCallback(async () => {
    if (packagesOverride) return;
    if (!available) return;
    setError(null);
    try {
      const loaded = await getAvailablePackages();
      setPackages(loaded);
      setSelected(loaded[0]?.identifier ?? null);
    } catch (err) {
      setError(message(err));
      setPackages([]);
    }
  }, [available, packagesOverride]);

  useEffect(() => {
    load();
  }, [load]);

  const buy = async () => {
    if (hasAccess) return;
    const pkg = packages?.find(p => p.identifier === selected);
    if (!pkg) return;
    setBusy(true);
    setError(null);
    try {
      const info = await purchasePackage(pkg);
      setActivated(hasPlusEntitlement(info));
      setNotice(hasPlusEntitlement(info) ? copy.text('Obligio Plus is active.') : copy.text('Purchase completed, but the entitlement is not active yet.'));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    setError(null);
    try {
      const info = await restorePurchases();
      setActivated(hasPlusEntitlement(info));
      setNotice(hasPlusEntitlement(info) ? copy.text('Obligio Plus restored.') : copy.text('No previous purchase was found for this account.'));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Obligio Plus" copy={copy} onClose={onClose}>
      {hasAccess ? (
        <>
          <Text style={s.detailTitle}>{copy.text('Obligio Plus is active')}</Text>
          <Text style={s.helper}>{copy.text('Your account has access to unlimited obligations, document evidence and recurring reminders.')}</Text>
          <Text style={s.helper}>{copy.text('If you have a paid subscription, manage or cancel it in your App Store or Google Play account. Deleting your Obligio account does not cancel a store subscription.')}</Text>
          <TouchableOpacity accessibilityRole="button" style={s.primary} onPress={onClose}>
            <Text style={s.primaryText}>{copy.text('Done')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
      <Text style={s.detailTitle}>{copy.text('Stay ahead with Obligio Plus')}</Text>
      <Text style={s.helper}>
        {copy.text('Unlimited obligations, document evidence, recurring reminders, and a clearer compliance view for your business.')}
      </Text>

      {!available ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>
            {copy.text('Plans are not available in this build. A RevenueCat store key has not been configured yet.')}
          </Text>
        </View>
      ) : packages === null ? (
        <ActivityIndicator color={colors.brand} />
      ) : packages.length === 0 ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>{copy.text('No subscription plans are currently offered for your store account.')}</Text>
        </View>
      ) : (
        packages.map(pkg => {
          const isSelected = pkg.identifier === selected;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              key={pkg.identifier}
              style={[s.choice, isSelected && s.choiceSelected]}
              onPress={() => setSelected(pkg.identifier)}>
              <View>
                <Text style={s.itemTitle}>{pkg.product.title}</Text>
                <Text style={s.muted}>{pkg.product.description}</Text>
              </View>
              <Text style={s.itemTitle}>{pkg.product.priceString}</Text>
            </TouchableOpacity>
          );
        })
      )}

      {notice && <Text style={s.noticeText}>{notice}</Text>}
      {error && <Text style={s.destructiveText}>{error}</Text>}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !selected || busy}}
        disabled={!selected || busy}
        style={[s.primary, (!selected || busy) && s.primaryDisabled]}
        onPress={buy}>
        <Text style={s.primaryText}>{busy ? copy.text('Working…') : copy.text('Subscribe')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !available || busy}}
        disabled={!available || busy}
        style={[s.secondary, (!available || busy) && s.primaryDisabled]}
        onPress={restore}>
        <Text style={s.secondaryText}>{copy.text('Restore purchases')}</Text>
      </TouchableOpacity>

      <Text style={s.disclaimer}>
        {copy.text('Subscriptions are managed through the App Store or Google Play. See Privacy and Terms.')}
      </Text>
        </>
      )}
    </ModalShell>
  );
}

export function TemplatePicker({
  copy,
  locale,
  templates,
  onClose,
  onAdopt,
}: {
  copy: Copy;
  locale: Locale;
  templates: RuleTemplate[] | undefined;
  onClose: () => void;
  onAdopt: (rule: RuleTemplate, dueDate: string) => Promise<void>;
}) {
  const {s, colors} = useAppTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dueIso = parseToIsoDate(due, locale);
  const dueTouched = due.trim().length > 0;

  const adopt = async (rule: RuleTemplate) => {
    if (!dueIso) return;
    setBusy(true);
    setError(null);
    try {
      await onAdopt(rule, dueIso);
      setOpenId(null);
      setDue('');
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title={copy.suggestedTitle} copy={copy} onClose={onClose}>
      <Text style={s.helper}>{copy.suggestedBody}</Text>
      <Text style={s.helper}>{copy.text(COVERAGE_NOTICE)}</Text>

      {templates === undefined ? (
        <ActivityIndicator color={colors.brand} />
      ) : templates.length === 0 ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>{copy.suggestedEmpty}</Text>
        </View>
      ) : (
        templates.map(sourceRule => {
          const rule = localizeTemplate(sourceRule, locale);
          const open = openId === rule._id;
          return (
            <View key={rule._id} style={s.detailCard}>
              <Text style={s.itemTitle}>{rule.title}</Text>
              <Text style={s.muted}>
                {rule.category}
                {rule.recurrence ? ` · ${copy.text('Repeats')} ${copy.text(repeatsLabel(rule.recurrence))}` : ` · ${copy.text('One-off')}`}
              </Text>
              <Text style={s.helper}>{rule.description}</Text>
              <Text style={s.sourceLine}>
                {copy.source}: {rule.sourceName} · {copy.reviewed} {formatDisplayDate(rule.reviewedAt, locale)}
              </Text>

              <TouchableOpacity accessibilityRole="link" onPress={async () => {try {await Linking.openURL(rule.sourceUrl);} catch {setError(copy.text('Could not open the official source.'));}}}><Text style={s.centeredLink}>{copy.text('Open official source')}</Text></TouchableOpacity>
              {open ? (
                <>
                  <TextInput
                    style={[s.input, dueTouched && !dueIso && s.inputInvalid]}
                    placeholder={dueDatePlaceholder(locale)}
                    accessibilityLabel={dueDatePlaceholder(locale)}
                    value={due}
                    onChangeText={setDue}
                    autoCapitalize="none"
                  />
                  <Text style={s.muted}>{copy.suggestedDateHint}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityState={{disabled: !dueIso || busy}}
                    disabled={!dueIso || busy}
                    style={[s.primary, (!dueIso || busy) && s.primaryDisabled]}
                    onPress={() => adopt(rule)}>
                    <Text style={s.primaryText}>{busy ? copy.creatingBusiness : copy.trackThis}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  style={s.secondary}
                  onPress={() => {
                    setOpenId(rule._id);
                    setDue('');
                    setError(null);
                  }}>
                  <Text style={s.secondaryText}>{copy.trackThis}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}

      {error && <Text style={s.destructiveText}>{error}</Text>}
      <Text style={s.disclaimer}>{copy.disclaimer}</Text>
    </ModalShell>
  );
}
