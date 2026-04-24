import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { getErrorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';

export default function VerifyTwoFactorScreen() {
  const { challenge, status, verifyTwoFactor } = useSession();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    }
  }, [status]);

  async function handleVerify() {
    try {
      setSubmitting(true);
      setError(null);
      const nextStatus = await verifyTwoFactor(code);
      router.replace(nextStatus === 'authenticated' ? '/(tabs)' : '/login');
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Validation 2FA</Text>
        <Text style={appStyles.subtitle}>
          Le compte admin envoie un code a usage unique par email via MailHog.
        </Text>
      </View>

      <SectionCard title="Saisir le code" subtitle={`Challenge en cours pour ${challenge?.email || 'cet utilisateur'}.`}>
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setCode}
          placeholder="000000"
          placeholderTextColor={palette.muted}
          style={styles.input}
          value={code}
        />
        <Text style={appStyles.subtitle}>
          En dev, ouvre MailHog sur `http://localhost:8025` pour lire le code envoye.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          disabled={submitting || code.trim().length < 6}
          label={submitting ? 'Verification...' : 'Valider le code'}
          onPress={() => void handleVerify()}
        />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FBF6F0',
    borderColor: '#E8DED2',
    borderRadius: 16,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 8,
    minHeight: 58,
    paddingHorizontal: 18,
    textAlign: 'center',
  },
  error: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
