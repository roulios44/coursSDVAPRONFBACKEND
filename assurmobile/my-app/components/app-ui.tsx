import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type RefreshControlProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const palette = {
  bg: '#F4F1EA',
  card: '#FFFDF8',
  ink: '#14213D',
  muted: '#6C757D',
  primary: '#C26A3D',
  primaryDark: '#8E4B29',
  border: '#E8DED2',
  success: '#2D6A4F',
  warning: '#B26A00',
  danger: '#A61E4D',
  accent: '#D9E8F5',
};

export { palette };

export function Screen({
  children,
  scroll = true,
  refreshControl,
}: PropsWithChildren<{
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
}>) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.scrollContent}>{children}</View>
  );

  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

export function SectionCard({
  children,
  title,
  subtitle,
  right,
}: PropsWithChildren<{ title?: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <View style={styles.card}>
      {(title || subtitle || right) && (
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
            {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'ghost';
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' && styles.buttonSecondary,
        tone === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      <Text
        style={[
          styles.buttonLabel,
          tone === 'secondary' && styles.buttonLabelSecondary,
          tone === 'ghost' && styles.buttonLabelGhost,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'success' && styles.badgeSuccess,
        tone === 'warning' && styles.badgeWarning,
        tone === 'danger' && styles.badgeDanger,
      ]}>
      <Text
        style={[
          styles.badgeText,
          tone === 'success' && styles.badgeTextSuccess,
          tone === 'warning' && styles.badgeTextWarning,
          tone === 'danger' && styles.badgeTextDanger,
        ]}>
        {label}
      </Text>
    </View>
  );
}

export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <SectionCard>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </SectionCard>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <View style={styles.loadingBlock}>
      <ActivityIndicator color={palette.primaryDark} />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

export const appStyles = StyleSheet.create({
  title: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fieldLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValue: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 14,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: palette.card,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonSecondary: {
    backgroundColor: palette.accent,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderColor: palette.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonLabel: {
    color: '#FFF8F1',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonLabelSecondary: {
    color: palette.ink,
  },
  buttonLabelGhost: {
    color: palette.primaryDark,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1E5DA',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeSuccess: {
    backgroundColor: '#DFF3E6',
  },
  badgeWarning: {
    backgroundColor: '#F8E8CC',
  },
  badgeDanger: {
    backgroundColor: '#F7D7E2',
  },
  badgeText: {
    color: palette.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  badgeTextSuccess: {
    color: palette.success,
  },
  badgeTextWarning: {
    color: palette.warning,
  },
  badgeTextDanger: {
    color: palette.danger,
  },
  metric: {
    backgroundColor: '#FBF6F0',
    borderRadius: 18,
    flex: 1,
    gap: 4,
    minWidth: 140,
    padding: 16,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  metricHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyMessage: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
  },
  loadingLabel: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
