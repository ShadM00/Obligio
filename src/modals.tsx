import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {PurchasesPackage} from 'react-native-purchases';
import {s} from './theme';
import {colors} from './designTokens';
import {formatDisplayDate, parseToIsoDate} from './dates';
import {dueDatePlaceholder, locales, type Locale} from './i18n';
import type {NewRequirement, Requirement, RuleTemplate} from './types';
import {getAvailablePackages, hasPlusEntitlement, isBillingAvailable, purchasePackage, restorePurchases} from './billing';

type Copy = (typeof locales)[Locale];

const RECURRENCE_OPTIONS = [
  {value: undefined, label: 'One-off'},
  {value: 'monthly', label: 'Monthly'},
  {value: 'quarterly', label: 'Quarterly'},
  {value: 'annual', label: 'Annual'},
] as const;

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function ModalShell({title, copy, onClose, children}: {title: string; copy: Copy; onClose: () => void; children: React.ReactNode}) {
  return (
    <View style={s.modal}>
      <View style={s.modalCard}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{title}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={onClose}>
            <Text style={s.link}>{copy.close}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </View>
  );
}

export function AddRequirement({
  copy,
  locale,
  onClose,
  onSave,
}: {
  copy: Copy;
  locale: Locale;
  onClose: () => void;
  onSave: (item: NewRequirement) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [due, setDue] = useState('');
  const [recurrence, setRecurrence] = useState<string | undefined>(undefined);
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
        status: 'upcoming',
      });
    } catch (err) {
      setError(message(err));
      setBusy(false);
    }
  };

  return (
    <ModalShell title={copy.addRequirement} copy={copy} onClose={onClose}>
      <TextInput style={s.input} placeholder="Requirement name" value={title} onChangeText={setTitle} />
      <TextInput style={s.input} placeholder="Category (e.g. Insurance)" value={category} onChangeText={setCategory} />
      <TextInput
        style={[s.input, dueTouched && !dueIso && s.inputInvalid]}
        placeholder={dueDatePlaceholder(locale)}
        value={due}
        onChangeText={setDue}
        autoCapitalize="none"
      />
      {dueTouched && !dueIso ? (
        <Text style={s.errorText}>Enter a real date, for example {dueDatePlaceholder(locale).split('e.g. ')[1]}</Text>
      ) : (
        dueIso && <Text style={s.muted}>Saving as {formatDisplayDate(dueIso, locale)}</Text>
      )}

      <Text style={s.monthHeading}>REPEATS</Text>
      <View style={s.row}>
        {RECURRENCE_OPTIONS.map(option => {
          const selected = recurrence === option.value;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{selected}}
              key={option.label}
              style={[s.chip, selected && s.chipSelected]}
              onPress={() => setRecurrence(option.value)}>
              <Text style={s.chipText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={s.destructiveText}>{error}</Text>}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !canSave}}
        style={[s.primary, !canSave && s.primaryDisabled]}
        disabled={!canSave}
        onPress={save}>
        <Text style={s.primaryText}>{busy ? 'Saving…' : 'Save requirement'}</Text>
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
}: {
  item: Requirement;
  copy: Copy;
  locale: Locale;
  onClose: () => void;
  onComplete: (item: Requirement) => Promise<void>;
  onAttach: (item: Requirement) => Promise<void>;
  onDelete: (item: Requirement) => Promise<void>;
}) {
  const [busy, setBusy] = useState<null | 'complete' | 'attach' | 'delete'>(null);
  const [error, setError] = useState<string | null>(null);
  const persisted = item._id !== null;

  const run = (kind: 'complete' | 'attach' | 'delete', action: () => Promise<void>) => async () => {
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
      ? 'Overdue — action required'
      : item.status === 'upcoming'
        ? 'Upcoming — prepare to renew'
        : 'Current — monitored';

  return (
    <ModalShell title="Obligation detail" copy={copy} onClose={onClose}>
      <Text style={s.detailTitle}>{item.title}</Text>
      <Text style={[s.detailStatus, item.status === 'current' && s.detailStatusCurrent]}>{statusCopy}</Text>
      <Text style={s.helper}>
        {item.category} · Due {formatDisplayDate(item.dueDate, locale)}
        {item.recurrence ? ` · Repeats ${item.recurrence}` : ''}
      </Text>

      <View style={s.detailCard}>
        <Text style={s.itemTitle}>Next action</Text>
        <Text style={s.helper}>
          {item.status === 'overdue'
            ? 'Resolve this obligation and attach current evidence.'
            : 'Review the requirement before its due date.'}
        </Text>
      </View>

      {!persisted && <Text style={s.muted}>{copy.sampleData}</Text>}
      {error && <Text style={s.destructiveText}>{error}</Text>}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        style={[s.primary, (!persisted || busy !== null) && s.primaryDisabled]}
        onPress={run('attach', () => onAttach(item))}>
        <Text style={s.primaryText}>
          {busy === 'attach' ? 'Uploading…' : item.hasDocument ? 'Replace evidence' : 'Attach evidence'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        style={[s.secondary, (!persisted || busy !== null) && s.primaryDisabled]}
        onPress={run('complete', () => onComplete(item))}>
        <Text style={s.secondaryText}>
          {busy === 'complete' ? 'Saving…' : item.recurrence ? 'Mark done & schedule next' : 'Mark as current'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !persisted || busy !== null}}
        disabled={!persisted || busy !== null}
        onPress={run('delete', () => onDelete(item))}>
        <Text style={s.destructiveText}>{busy === 'delete' ? 'Removing…' : 'Delete obligation'}</Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

export function Paywall({copy, onClose}: {copy: Copy; onClose: () => void}) {
  const available = isBillingAvailable();
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
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
  }, [available]);

  useEffect(() => {
    load();
  }, [load]);

  const buy = async () => {
    const pkg = packages?.find(p => p.identifier === selected);
    if (!pkg) return;
    setBusy(true);
    setError(null);
    try {
      const info = await purchasePackage(pkg);
      setNotice(hasPlusEntitlement(info) ? 'Obligio Plus is active.' : 'Purchase completed, but the entitlement is not active yet.');
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
      setNotice(hasPlusEntitlement(info) ? 'Obligio Plus restored.' : 'No previous purchase was found for this account.');
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Obligio Plus" copy={copy} onClose={onClose}>
      <Text style={s.detailTitle}>Stay ahead with Obligio Plus</Text>
      <Text style={s.helper}>
        Unlimited obligations, document evidence, recurring reminders, and a clearer compliance view for your business.
      </Text>

      {!available ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>
            Plans are not available in this build. A RevenueCat store key has not been configured yet.
          </Text>
        </View>
      ) : packages === null ? (
        <ActivityIndicator color={colors.forest600} />
      ) : packages.length === 0 ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>No subscription plans are currently offered for your store account.</Text>
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
        <Text style={s.primaryText}>{busy ? 'Working…' : 'Subscribe'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{disabled: !available || busy}}
        disabled={!available || busy}
        style={[s.secondary, (!available || busy) && s.primaryDisabled]}
        onPress={restore}>
        <Text style={s.secondaryText}>Restore purchases</Text>
      </TouchableOpacity>

      <Text style={s.disclaimer}>
        Subscriptions are managed through the App Store or Google Play. See Privacy and Terms.
      </Text>
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

      {templates === undefined ? (
        <ActivityIndicator color={colors.forest600} />
      ) : templates.length === 0 ? (
        <View style={s.banner}>
          <Text style={s.bannerText}>{copy.suggestedEmpty}</Text>
        </View>
      ) : (
        templates.map(rule => {
          const open = openId === rule._id;
          return (
            <View key={rule._id} style={s.detailCard}>
              <Text style={s.itemTitle}>{rule.title}</Text>
              <Text style={s.muted}>
                {rule.category}
                {rule.recurrence ? ` · Repeats ${rule.recurrence}` : ' · One-off'}
              </Text>
              <Text style={s.helper}>{rule.description}</Text>
              <Text style={s.sourceLine}>
                {copy.source}: {rule.sourceName} · {copy.reviewed} {formatDisplayDate(rule.reviewedAt, locale)}
              </Text>

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
