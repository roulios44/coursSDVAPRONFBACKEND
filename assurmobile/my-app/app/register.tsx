import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { FormField } from '@/components/form-field';
import { getErrorMessage, registerUser } from '@/lib/api';
import type { RoleName } from '@/types/api';

const ROLES: RoleName[] = ['ADMIN', 'GESTIONNAIRE', 'CHARGE_SUIVI', 'CHARGE_CLIENTELE', 'ASSURE'];

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleName>('ASSURE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleRegister() {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await registerUser({
        nom,
        prenom,
        email,
        telephone: telephone || null,
        mot_de_passe: password,
        role_nom: role,
      });
      setSuccess('Compte cree. Tu peux maintenant te connecter.');
    } catch (registerError) {
      setError(getErrorMessage(registerError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Creer un compte</Text>
        <Text style={appStyles.subtitle}>Creation via `POST /api/auth/register`.</Text>
      </View>

      <SectionCard title="Informations utilisateur">
        <FormField label="Nom" onChangeText={setNom} value={nom} />
        <FormField label="Prenom" onChangeText={setPrenom} value={prenom} />
        <FormField autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
        <FormField keyboardType="phone-pad" label="Telephone" onChangeText={setTelephone} value={telephone} />
        <FormField label="Mot de passe" onChangeText={setPassword} secureTextEntry value={password} />
      </SectionCard>

      <SectionCard title="Role">
        <View style={appStyles.rowWrap}>
          {ROLES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRole(item)}
              style={{
                backgroundColor: role === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                maxWidth: '100%',
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: role === item ? '#FFF8F1' : palette.ink, fontWeight: '800', flexShrink: 1 }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
      {success ? <Text style={[appStyles.fieldValue, { color: '#2D6A4F' }]}>{success}</Text> : null}
      <PrimaryButton disabled={submitting} label={submitting ? 'Creation...' : 'Creer le compte'} onPress={() => void handleRegister()} />
      <PrimaryButton label="Retour connexion" onPress={() => router.replace('/login')} tone="ghost" />
    </Screen>
  );
}
