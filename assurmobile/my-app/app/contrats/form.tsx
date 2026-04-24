import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { FormField } from '@/components/form-field';
import { OptionSelector } from '@/components/option-selector';
import { createContrat, getAssures, getErrorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Assure, ContratPayload } from '@/types/api';

const TYPES = ['responsabilite_civile', 'tous_risques', 'intermediaire'];
const STATUTS = ['actif', 'suspendu', 'clos'];

export default function ContratFormScreen() {
  const { token, user } = useSession();
  const [assures, setAssures] = useState<Assure[]>([]);
  const [assureId, setAssureId] = useState('');
  const [numeroContrat, setNumeroContrat] = useState(`CTR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [typeContrat, setTypeContrat] = useState('responsabilite_civile');
  const [franchise, setFranchise] = useState('0');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 10));
  const [dateFin, setDateFin] = useState('');
  const [statut, setStatut] = useState('actif');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assuresVisibles = useMemo(() => {
    const assureConnecte = assures.find((assure) => assure.utilisateur_id === user?.id);
    return assureConnecte ? [assureConnecte] : assures;
  }, [assures, user?.id]);

  useEffect(() => {
    async function loadAssures() {
      if (!token) return;

      try {
        const data = await getAssures(token);
        setAssures(data);
        const current = data.find((assure) => assure.utilisateur_id === user?.id);
        if (current) {
          setAssureId(String(current.id));
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadAssures();
  }, [token, user?.id]);

  async function handleSubmit() {
    if (!token) return;
    if (!assureId) {
      setError('Crée ou sélectionne un profil assuré avant de créer un contrat.');
      return;
    }

    const payload: ContratPayload = {
      assure_id: Number(assureId),
      numero_contrat: numeroContrat,
      type_contrat: typeContrat,
      franchise: franchise ? Number(franchise) : null,
      date_debut: dateDebut || null,
      date_fin: dateFin || null,
      statut,
    };

    try {
      setSubmitting(true);
      setError(null);
      await createContrat(token, payload);
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
        <Text style={appStyles.title}>Nouveau contrat</Text>
        <Text style={appStyles.subtitle}>
          Un contrat doit être rattaché à un profil assuré.
        </Text>
      </View>

      <SectionCard title="Assuré">
        <OptionSelector
          emptyMessage="Aucun profil assuré disponible. Crée d'abord un profil assuré."
          label="Profil assuré"
          onChange={(value) => setAssureId(String(value))}
          options={assuresVisibles.map((assure) => ({
            label: `${assure.prenom} ${assure.nom}`,
            subtitle: `${assure.email || 'Email absent'} · ${assure.type_assure}`,
            value: assure.id,
          }))}
          value={assureId ? Number(assureId) : null}
        />
        <PrimaryButton label="Créer un profil assuré" onPress={() => router.push('/assures/form')} tone="secondary" />
      </SectionCard>

      <SectionCard title="Contrat">
        <FormField label="Numéro contrat" onChangeText={setNumeroContrat} value={numeroContrat} />
        <View style={appStyles.rowWrap}>
          {TYPES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTypeContrat(item)}
              style={{
                backgroundColor: typeContrat === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: typeContrat === item ? '#FFF8F1' : palette.ink, fontWeight: '800' }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <FormField keyboardType="decimal-pad" label="Franchise" onChangeText={setFranchise} value={franchise} />
        <FormField label="Date début YYYY-MM-DD" onChangeText={setDateDebut} value={dateDebut} />
        <FormField label="Date fin YYYY-MM-DD" onChangeText={setDateFin} value={dateFin} />
        <View style={appStyles.rowWrap}>
          {STATUTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setStatut(item)}
              style={{
                backgroundColor: statut === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: statut === item ? '#FFF8F1' : palette.ink, fontWeight: '800' }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
      <PrimaryButton disabled={submitting} label={submitting ? 'Création...' : 'Créer le contrat'} onPress={() => void handleSubmit()} />
    </Screen>
  );
}
