import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appStyles, palette } from '@/components/app-ui';

interface OptionSelectorProps<T extends string | number> {
  emptyMessage?: string;
  label: string;
  onChange: (value: T) => void;
  options: {
    label: string;
    subtitle?: string;
    value: T;
  }[];
  value: T | null;
}

export function OptionSelector<T extends string | number>({
  emptyMessage = 'Aucune option disponible.',
  label,
  onChange,
  options,
  value,
}: OptionSelectorProps<T>) {
  return (
    <View style={styles.wrapper}>
      <Text style={appStyles.fieldLabel}>{label}</Text>
      {options.length === 0 ? (
        <Text style={appStyles.subtitle}>{emptyMessage}</Text>
      ) : (
        options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}>
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              {option.subtitle ? (
                <Text style={[styles.optionSubtitle, selected && styles.optionSubtitleSelected]}>
                  {option.subtitle}
                </Text>
              ) : null}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  option: {
    backgroundColor: '#FBF6F0',
    borderColor: '#E8DED2',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  optionSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  optionLabel: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  optionLabelSelected: {
    color: '#FFF8F1',
  },
  optionSubtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  optionSubtitleSelected: {
    color: '#FFF2E4',
  },
});
