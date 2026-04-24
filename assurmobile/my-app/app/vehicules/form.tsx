import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { FormField } from '@/components/form-field';
import { OptionSelector } from '@/components/option-selector';
import { createVehicule, getAssures, getContrats, getErrorMessage } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Assure, Contrat, VehiculePayload } from '@/types/api';

export default function VehiculeFormScreen() {
  const { token, user } = useSession();
  const [assures, setAssures] = useState<Assure[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [contratId, setContratId] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [valeurArgus, setValeurArgus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contratsVisibles = useMemo(() => {
    const assureConnecte = assures.find((assure) => assure.utilisateur_id === user?.id);
    if (!assureConnecte) {
      return contrats;
    }

    return contrats.filter((contrat) => contrat.assure_id === assureConnecte.id);
  }, [assures, contrats, user?.id]);

  useEffect(() => {
    async function loadReferences() {
      if (!token) return;

      try {
        const [assuresData, contratsData] = await Promise.all([
          getAssures(token),
          getContrats(token),
        ]);
        setAssures(assuresData);
        setContrats(contratsData);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadReferences();
  }, [token]);

  async function handleSubmit() {
    if (!token) return;
    if (!contratId) {
      setError('Sélectionne un contrat avant de créer un véhicule.');
      return;
    }

    const payload: VehiculePayload = {
      contrat_id: Number(contratId),
      immatriculation,
      marque: marque || null,
      modele: modele || null,
      valeur_argus: valeurArgus ? Number(valeurArgus) : null,
    };

    try {
      setSubmitting(true);
      setError(null);
      await createVehicule(token, payload);
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
        <Text style={appStyles.title}>Nouveau véhicule</Text>
        <Text style={appStyles.subtitle}>
          Un véhicule doit être rattaché à un contrat existant.
        </Text>
      </View>

      <SectionCard title="Contrat">
        <OptionSelector
          emptyMessage="Aucun contrat disponible. Crée d'abord un contrat."
          label="Contrat"
          onChange={(value) => setContratId(String(value))}
          options={contratsVisibles.map((contrat) => ({
            label: contrat.numero_contrat || `Contrat #${contrat.id}`,
            subtitle: `${contrat.type_contrat || 'Type non renseigné'} · Assuré #${contrat.assure_id}`,
            value: contrat.id,
          }))}
          value={contratId ? Number(contratId) : null}
        />
        <PrimaryButton label="Créer un contrat" onPress={() => router.push('/contrats/form')} tone="secondary" />
      </SectionCard>

      <SectionCard title="Véhicule">
        <FormField autoCapitalize="characters" label="Immatriculation" onChangeText={setImmatriculation} value={immatriculation} />
        <FormField label="Marque" onChangeText={setMarque} value={marque} />
        <FormField label="Modèle" onChangeText={setModele} value={modele} />
        <FormField keyboardType="decimal-pad" label="Valeur argus" onChangeText={setValeurArgus} value={valeurArgus} />
      </SectionCard>

      {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
      <PrimaryButton disabled={submitting} label={submitting ? 'Création...' : 'Créer le véhicule'} onPress={() => void handleSubmit()} />
    </Screen>
  );
}
