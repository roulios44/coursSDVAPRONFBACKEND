import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { appStyles, palette } from '@/components/app-ui';

export function FormField({
  label,
  multiline,
  ...props
}: TextInputProps & {
  label: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={appStyles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={palette.muted}
        style={[styles.input, multiline && styles.textarea]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  input: {
    backgroundColor: '#FBF6F0',
    borderColor: '#E8DED2',
    borderRadius: 16,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  textarea: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
});
