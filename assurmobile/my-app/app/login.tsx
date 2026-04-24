import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { getErrorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';

const DEMO_ACCOUNTS = [
  { label: 'Charge clientele', email: 'clientele@assurmoi.local', password: 'client123' },
  { label: 'Charge suivi', email: 'suivi@assurmoi.local', password: 'suivi123' },
  { label: 'Assure', email: 'assure@assurmoi.local', password: 'assure123' },
  { label: 'Admin + 2FA', email: 'admin@assurmoi.local', password: 'admin123' },
];

export default function LoginScreen() {
  const { status, signIn } = useSession();
  const [email, setEmail] = useState('clientele@assurmoi.local');
  const [password, setPassword] = useState('client123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    }
  }, [status]);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setError(null);
      const nextStatus = await signIn(email, password);
      router.replace(nextStatus === 'challenge' ? '/verify-2fa' : '/(tabs)');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={{ gap: 20 }}>
          <View style={{ gap: 6 }}>
            <Text style={appStyles.title}>AssurMoi Mobile</Text>
            <Text style={appStyles.subtitle}>
              Connecte l&apos;application Expo a ton backend `localhost:3000` pour suivre sinistres et dossiers.
            </Text>
          </View>

          <SectionCard title="Connexion" subtitle="Authentification utilisateur puis recuperation des routes protegees.">
            <View style={styles.field}>
              <Text style={appStyles.fieldLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="prenom@assurmoi.local"
                placeholderTextColor={palette.muted}
                style={styles.input}
                value={email}
              />
            </View>
            <View style={styles.field}>
              <Text style={appStyles.fieldLabel}>Mot de passe</Text>
              <TextInput
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={palette.muted}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              disabled={submitting}
              label={submitting ? 'Connexion...' : 'Se connecter'}
              onPress={() => void handleSubmit()}
            />
            <PrimaryButton
              label="Creer un compte"
              onPress={() => router.push('/register')}
              tone="ghost"
            />
          </SectionCard>

          <SectionCard title="Acces rapides" subtitle="Comptes semes dans `assurmoi/data/store.js`.">
            <View style={styles.accountGrid}>
              {DEMO_ACCOUNTS.map((account) => (
                <Pressable
                  key={account.label}
                  onPress={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  style={styles.accountButton}>
                  <Text style={styles.accountLabel}>{account.label}</Text>
                  <Text style={styles.accountValue}>{account.email}</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>
        </View>
      </KeyboardAvoidingView>
    </Screen>
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
  error: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  accountGrid: {
    gap: 10,
  },
  accountButton: {
    backgroundColor: '#FBF6F0',
    borderRadius: 16,
    gap: 4,
    padding: 14,
  },
  accountLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  accountValue: {
    color: palette.muted,
    fontSize: 13,
  },
});
