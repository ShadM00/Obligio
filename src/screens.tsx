import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {s} from './theme';
import {colors, radii, typography} from './designTokens';
import {formatDisplayDate, monthLabel} from './dates';
import type {Locale} from './i18n';
import {locales} from './i18n';
import type {Requirement, RequirementStatus} from './types';

type Copy = (typeof locales)[Locale];

const STATUS_LABELS: Record<RequirementStatus, keyof Copy> = {
  current: 'current',
  upcoming: 'upcoming',
  overdue: 'overdue',
};

function statusLabel(copy: Copy, status: RequirementStatus): string {
  return copy[STATUS_LABELS[status]] as string;
}

export function ErrorBanner({message, onRetry, retryLabel}: {message: string; onRetry?: () => void; retryLabel: string}) {
  return (
    <View style={s.errorBox}>
      <Text style={s.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity accessibilityRole="button" onPress={onRetry}>
          <Text style={s.linkSpaced}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Welcome({
  copy,
  onStart,
  busy,
  error,
}: {
  copy: Copy;
  onStart: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.welcome}>
        <View
          accessibilityRole="image"
          accessibilityLabel="Obligio logo"
          style={[s.logo, {backgroundColor: colors.forest800, borderRadius: radii.card}]}>
          <Text style={s.logoText}>✓</Text>
        </View>
        <Text style={s.eyebrow}>{copy.appName}</Text>
        <Text style={[s.welcomeTitle, typography.display]}>Your business obligations, under control.</Text>
        <Text style={[s.welcomeBody, typography.body]}>
          Track licences, insurance, filings, inspections, and documents in one calm place.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Set up my business"
          accessibilityState={{disabled: busy}}
          disabled={busy}
          style={[s.primary, busy && s.primaryDisabled]}
          onPress={onStart}>
          <Text style={s.primaryText}>{busy ? 'Setting up…' : 'Set up my business'}</Text>
        </TouchableOpacity>
        {error && <ErrorBanner message={error} onRetry={onStart} retryLabel={copy.tryAgain} />}
        <Text style={s.disclaimer}>{copy.disclaimer}</Text>
      </View>
    </SafeAreaView>
  );
}

export function Stat({value, label, color}: {value: string; label: string; color: string}) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, {color}]}>{value}</Text>
      <Text style={s.muted}>{label}</Text>
    </View>
  );
}

export function ItemRow({
  item,
  copy,
  locale,
  onPress,
}: {
  item: Requirement;
  copy: Copy;
  locale: Locale;
  onPress?: () => void;
}) {
  const dotStyle =
    item.status === 'current' ? s.currentDot : item.status === 'upcoming' ? s.upcomingDot : s.overdueDot;
  const label = statusLabel(copy, item.status);
  const due = formatDisplayDate(item.dueDate, locale);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${label}, due ${due}${item.hasDocument ? ', evidence attached' : ''}`}
      onPress={onPress}
      style={s.item}>
      <View accessibilityElementsHidden importantForAccessibility="no" style={[s.dot, dotStyle]} />
      <View style={s.itemBody}>
        <Text style={s.itemTitle}>{item.title}</Text>
        <Text style={s.muted}>
          {item.category} · {due} · {label}
        </Text>
      </View>
      {item.hasDocument && <Text style={s.paperclip}>▣</Text>}
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function Home({
  copy,
  locale,
  items,
  onAdd,
  onSelect,
}: {
  copy: Copy;
  locale: Locale;
  items: Requirement[];
  onAdd: () => void;
  onSelect: (item: Requirement) => void;
}) {
  const current = items.filter(x => x.status === 'current').length;
  const upcoming = items.filter(x => x.status === 'upcoming').length;
  const overdue = items.filter(x => x.status === 'overdue').length;
  const outstanding = upcoming + overdue;
  const score = items.length === 0 ? 100 : Math.round((current / items.length) * 100);
  const needsAttention = items.filter(x => x.status !== 'current');

  return (
    <>
      <View style={s.scoreCard}>
        <View>
          <Text style={s.score}>{score}%</Text>
          <Text style={s.scoreLabel}>{copy.complianceHealth}</Text>
          <Text style={s.darkMuted}>{outstanding === 0 ? copy.scoreHintClear : copy.scoreHint(outstanding)}</Text>
        </View>
        <View accessibilityLabel={`${score} percent compliance health`} style={s.ring}>
          <Text style={s.ringText}>✓</Text>
        </View>
      </View>

      <View style={s.stats}>
        <Stat value={String(current)} label={copy.current} color={colors.forest600} />
        <Stat value={String(upcoming)} label={copy.upcoming} color={colors.amber700} />
        <Stat value={String(overdue)} label={copy.overdue} color={colors.red700} />
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{copy.attention}</Text>
      </View>
      {needsAttention.length === 0 ? (
        <Text style={s.helper}>{items.length === 0 ? copy.noRequirements : copy.scoreHintClear}</Text>
      ) : (
        needsAttention.map((item, index) => (
          <ItemRow
            key={item._id ?? `sample-${index}`}
            item={item}
            copy={copy}
            locale={locale}
            onPress={() => onSelect(item)}
          />
        ))
      )}

      <TouchableOpacity accessibilityRole="button" style={s.primary} onPress={onAdd}>
        <Text style={s.primaryText}>+ {copy.addRequirement}</Text>
      </TouchableOpacity>
    </>
  );
}

export function CalendarScreen({
  copy,
  locale,
  items,
  onSelect,
}: {
  copy: Copy;
  locale: Locale;
  items: Requirement[];
  onSelect: (item: Requirement) => void;
}) {
  const ordered = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const months: {label: string; rows: Requirement[]}[] = [];
  for (const item of ordered) {
    const label = monthLabel(item.dueDate);
    const bucket = months.find(m => m.label === label);
    if (bucket) bucket.rows.push(item);
    else months.push({label, rows: [item]});
  }

  if (ordered.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyIcon}>□</Text>
        <Text style={s.sectionTitle}>{copy.calendar}</Text>
        <Text style={s.helper}>{copy.noRequirements}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={s.helper}>Upcoming deadlines are grouped by month.</Text>
      {months.map(month => (
        <View key={month.label}>
          <Text style={s.monthHeading}>{month.label.toUpperCase()}</Text>
          {month.rows.map((item, index) => (
            <ItemRow
              key={item._id ?? `sample-${month.label}-${index}`}
              item={item}
              copy={copy}
              locale={locale}
              onPress={() => onSelect(item)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function DocumentsScreen({
  copy,
  locale,
  items,
  onSelect,
}: {
  copy: Copy;
  locale: Locale;
  items: Requirement[];
  onSelect: (item: Requirement) => void;
}) {
  const withEvidence = items.filter(x => x.hasDocument);
  const withoutEvidence = items.filter(x => !x.hasDocument);

  return (
    <View>
      <Text style={s.helper}>
        Upload insurance certificates, licences, permits, and training records. They stay linked to the obligation they
        support — open an obligation to attach its evidence.
      </Text>

      {withEvidence.length > 0 && (
        <>
          <Text style={s.monthHeading}>ATTACHED</Text>
          {withEvidence.map((item, index) => (
            <ItemRow key={item._id ?? `doc-${index}`} item={item} copy={copy} locale={locale} onPress={() => onSelect(item)} />
          ))}
        </>
      )}

      {withoutEvidence.length > 0 && (
        <>
          <Text style={s.monthHeading}>MISSING EVIDENCE</Text>
          {withoutEvidence.map((item, index) => (
            <ItemRow key={item._id ?? `nodoc-${index}`} item={item} copy={copy} locale={locale} onPress={() => onSelect(item)} />
          ))}
        </>
      )}

      {items.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>▣</Text>
          <Text style={s.sectionTitle}>{copy.documents}</Text>
          <Text style={s.helper}>{copy.noRequirements}</Text>
        </View>
      )}
    </View>
  );
}

export function SettingsScreen({
  onSubscribe,
  onEnableNotifications,
  notificationsEnabled,
  billingAvailable,
}: {
  onSubscribe: () => void;
  onEnableNotifications: () => void;
  notificationsEnabled: boolean;
  billingAvailable: boolean;
}) {
  const rows: {label: string; hint?: string; onPress?: () => void}[] = [
    {label: 'Business profile'},
    {
      label: 'Notification preferences',
      hint: notificationsEnabled ? 'Deadline reminders are on' : 'Tap to enable deadline reminders',
      onPress: onEnableNotifications,
    },
    {
      label: 'Subscription',
      hint: billingAvailable ? undefined : 'Plans are not available in this build',
      onPress: onSubscribe,
    },
    {label: 'Privacy & data'},
    {label: 'Help & support'},
  ];

  return (
    <View>
      {rows.map(row => (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{disabled: !row.onPress}}
          disabled={!row.onPress}
          onPress={row.onPress}
          style={s.setting}
          key={row.label}>
          <View>
            <Text style={s.itemTitle}>{row.label}</Text>
            {row.hint && <Text style={s.muted}>{row.hint}</Text>}
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function ScreenScroll({children}: {children: React.ReactNode}) {
  return <ScrollView contentContainerStyle={s.container}>{children}</ScrollView>;
}
