import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { FormField } from '@/components/form-field';
import { OptionSelector } from '@/components/option-selector';
import { createDossier, getDossier, getErrorMessage, getSinistres, getUsers, updateDossier } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { DossierPayload, Sinistre, User } from '@/types/api';

const STATUTS = ['initialise', 'en_attente_expertise', 'expertise_planifiee', 'expertise_realisee', 'en_cours', 'reglement_realise', 'clos'];
const SCENARIOS = ['reparable', 'non_reparable'];

export default function DossierFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token } = useSession();
  const dossierId = useMemo(() => (id ? Number(id) : null), [id]);
  const isEditing = Boolean(dossierId);

  const [sinistreId, setSinistreId] = useState('');
  const [numeroDossier, setNumeroDossier] = useState(`DOS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [chargeSuiviId, setChargeSuiviId] = useState('');
  const [gestionnaireId, setGestionnaireId] = useState('');
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [scenario, setScenario] = useState('reparable');
  const [statut, setStatut] = useState('initialise');
  const [dateOuverture, setDateOuverture] = useState(new Date().toISOString());
  const [dateCloture, setDateCloture] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReferences() {
      if (!token) return;

      try {
        const [sinistresData, usersData] = await Promise.all([
          getSinistres(token),
          getUsers(token),
        ]);
        setSinistres(sinistresData);
        setUsers(usersData);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadReferences();
  }, [token]);

  useEffect(() => {
    async function loadDossier() {
      if (!token || !dossierId) return;

      try {
        const dossier = await getDossier(token, dossierId);
        setSinistreId(String(dossier.sinistre_id || ''));
        setNumeroDossier(dossier.numero_dossier || '');
        setChargeSuiviId(String(dossier.charge_suivi_id || ''));
        setGestionnaireId(String(dossier.gestionnaire_id || ''));
        setScenario(dossier.scenario || 'reparable');
        setStatut(dossier.statut || 'initialise');
        setDateOuverture(dossier.date_ouverture || new Date().toISOString());
        setDateCloture(dossier.date_cloture || '');
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadDossier();
  }, [dossierId, token]);

  async function handleSubmit() {
    if (!token) return;
    if (!sinistreId) {
      setError('Selectionne un sinistre avant d enregistrer.');
      return;
    }

    const payload: DossierPayload = {
      sinistre_id: Number(sinistreId),
      numero_dossier: numeroDossier,
      charge_suivi_id: chargeSuiviId ? Number(chargeSuiviId) : null,
      gestionnaire_id: gestionnaireId ? Number(gestionnaireId) : null,
      scenario,
      statut,
      date_ouverture: dateOuverture || null,
      date_cloture: dateCloture || null,
    };

    try {
      setSubmitting(true);
      setError(null);

      if (isEditing && dossierId) {
        await updateDossier(token, dossierId, payload);
      } else {
        await createDossier(token, payload);
      }

      router.replace('/(tabs)/dossiers');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>{isEditing ? 'Modifier le dossier' : 'Nouveau dossier'}</Text>
        <Text style={appStyles.subtitle}>Le dossier doit etre rattache a un sinistre existant.</Text>
      </View>

      <SectionCard title="Rattachement">
        <OptionSelector
          emptyMessage="Aucun sinistre disponible."
          label="Sinistre"
          onChange={(value) => setSinistreId(String(value))}
          options={sinistres.map((sinistre) => ({
            label: `Sinistre #${sinistre.id} · ${sinistre.vehicule?.immatriculation || 'vehicule inconnu'}`,
            subtitle: `${sinistre.conducteur_prenom} ${sinistre.conducteur_nom} · ${sinistre.statut}`,
            value: sinistre.id,
          }))}
          value={sinistreId ? Number(sinistreId) : null}
        />
        <FormField label="Numero dossier" onChangeText={setNumeroDossier} value={numeroDossier} />
        <OptionSelector
          emptyMessage="Aucun utilisateur disponible."
          label="Charge de suivi"
          onChange={(value) => setChargeSuiviId(String(value))}
          options={users
            .filter((item) => ['CHARGE_SUIVI', 'GESTIONNAIRE', 'ADMIN'].includes(String(item.role_nom)))
            .map((item) => ({
              label: `${item.prenom} ${item.nom}`,
              subtitle: `${item.email} · ${item.role_nom || 'Role inconnu'}`,
              value: item.id,
            }))}
          value={chargeSuiviId ? Number(chargeSuiviId) : null}
        />
        <OptionSelector
          emptyMessage="Aucun gestionnaire disponible."
          label="Gestionnaire"
          onChange={(value) => setGestionnaireId(String(value))}
          options={users
            .filter((item) => ['GESTIONNAIRE', 'ADMIN'].includes(String(item.role_nom)))
            .map((item) => ({
              label: `${item.prenom} ${item.nom}`,
              subtitle: `${item.email} · ${item.role_nom || 'Role inconnu'}`,
              value: item.id,
            }))}
          value={gestionnaireId ? Number(gestionnaireId) : null}
        />
      </SectionCard>

      <SectionCard title="Scenario">
        <View style={appStyles.rowWrap}>
          {SCENARIOS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setScenario(item)}
              style={{
                backgroundColor: scenario === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: scenario === item ? '#FFF8F1' : palette.ink, fontWeight: '800' }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Statut et dates">
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
        <FormField label="Date ouverture ISO" onChangeText={setDateOuverture} value={dateOuverture} />
        <FormField label="Date cloture ISO" onChangeText={setDateCloture} value={dateCloture} />
      </SectionCard>

      {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
      <PrimaryButton
        disabled={submitting}
        label={submitting ? 'Enregistrement...' : 'Enregistrer'}
        onPress={() => void handleSubmit()}
      />
    </Screen>
  );
}
