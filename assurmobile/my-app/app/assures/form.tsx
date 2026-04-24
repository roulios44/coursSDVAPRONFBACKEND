import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { FormField } from '@/components/form-field';
import { createAssure, getErrorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { AssurePayload } from '@/types/api';

const TYPES = ['particulier', 'professionnel'];

export default function AssureFormScreen() {
  const { token, user } = useSession();
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [adresse, setAdresse] = useState('');
  const [typeAssure, setTypeAssure] = useState('particulier');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!token || !user) return;

    const payload: AssurePayload = {
      utilisateur_id: user.id,
      nom,
      prenom,
      email: email || null,
      telephone: telephone || null,
      adresse: adresse || null,
      type_assure: typeAssure,
    };

    try {
      setSubmitting(true);
      setError(null);
      await createAssure(token, payload);
      router.replace('/(tabs)/compte');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Profil assuré</Text>
        <Text style={appStyles.subtitle}>
          Ce profil permet ensuite de rattacher des contrats a ton utilisateur.
        </Text>
      </View>

      <SectionCard title="Identité assuré">
        <FormField label="Nom" onChangeText={setNom} value={nom} />
        <FormField label="Prénom" onChangeText={setPrenom} value={prenom} />
        <FormField autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
        <FormField keyboardType="phone-pad" label="Téléphone" onChangeText={setTelephone} value={telephone} />
        <FormField label="Adresse" onChangeText={setAdresse} value={adresse} />
      </SectionCard>

      <SectionCard title="Type assuré">
        <View style={appStyles.rowWrap}>
          {TYPES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTypeAssure(item)}
              style={{
                backgroundColor: typeAssure === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: typeAssure === item ? '#FFF8F1' : palette.ink, fontWeight: '800' }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
      <PrimaryButton disabled={submitting} label={submitting ? 'Création...' : 'Créer le profil assuré'} onPress={() => void handleSubmit()} />
    </Screen>
  );
}
