import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Badge, LoadingBlock, PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { getAssures, getContrats, getErrorMessage, getVehicules } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Assure, Contrat, Vehicule } from '@/types/api';

export default function CompteScreen() {
  const router = useRouter();
  const { apiBaseUrl, signOut, token, user } = useSession();
  const [assures, setAssures] = useState<Assure[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assureConnecte = useMemo(
    () => assures.find((assure) => assure.utilisateur_id === user?.id) || null,
    [assures, user?.id],
  );

  const contratsUtilisateur = useMemo(() => {
    if (!assureConnecte) {
      return [];
    }

    return contrats.filter((contrat) => contrat.assure_id === assureConnecte.id);
  }, [assureConnecte, contrats]);

  const vehiculesUtilisateur = useMemo(() => {
    const contratIds = new Set(contratsUtilisateur.map((contrat) => contrat.id));
    return vehicules.filter((vehicule) => vehicule.contrat_id && contratIds.has(vehicule.contrat_id));
  }, [contratsUtilisateur, vehicules]);

  const loadInsuranceData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [assuresData, contratsData, vehiculesData] = await Promise.all([
        getAssures(token),
        getContrats(token),
        getVehicules(token),
      ]);
      setAssures(assuresData);
      setContrats(contratsData);
      setVehicules(vehiculesData);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadInsuranceData();
  }, [loadInsuranceData]));

  async function handleLogout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Compte</Text>
        <Text style={appStyles.subtitle}>
          Profil courant, role applicatif et configuration de connexion au backend.
        </Text>
      </View>

      <SectionCard title="Identite">
        <Text style={appStyles.fieldLabel}>Nom complet</Text>
        <Text style={appStyles.fieldValue}>
          {user?.prenom} {user?.nom}
        </Text>
        <View style={appStyles.separator} />
        <Text style={appStyles.fieldLabel}>Email</Text>
        <Text style={appStyles.fieldValue}>{user?.email}</Text>
        <View style={appStyles.separator} />
        <Text style={appStyles.fieldLabel}>Role</Text>
        <Badge label={user?.role_nom || 'Inconnu'} />
      </SectionCard>

      <SectionCard title="Connexion API" subtitle="URL resolue automatiquement pour Expo selon la plateforme.">
        <Text style={appStyles.fieldValue}>{apiBaseUrl}</Text>
        <Text style={appStyles.subtitle}>
          Sur telephone physique, tu peux forcer l&apos;URL avec `EXPO_PUBLIC_API_BASE_URL`.
        </Text>
      </SectionCard>

      <SectionCard
        title="Données assurance"
        subtitle="Crée les données nécessaires avant de déclarer un sinistre.">
        {loading ? <LoadingBlock label="Chargement de tes données assurance..." /> : null}
        {error ? <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text> : null}
        {!loading && assureConnecte ? (
          <View style={{ gap: 8 }}>
            <Text style={appStyles.fieldLabel}>Profil assuré</Text>
            <Text style={appStyles.fieldValue}>
              {assureConnecte.prenom} {assureConnecte.nom}
            </Text>
            <Text style={appStyles.subtitle}>
              {assureConnecte.email || 'Email non renseigné'} · {assureConnecte.type_assure}
            </Text>
            {assureConnecte.adresse ? <Text style={appStyles.subtitle}>{assureConnecte.adresse}</Text> : null}
          </View>
        ) : null}
        {!loading && !assureConnecte ? (
          <PrimaryButton label="Créer mon profil assuré" onPress={() => router.push('/assures/form')} tone="secondary" />
        ) : null}
        <PrimaryButton label="Créer un contrat" onPress={() => router.push('/contrats/form')} tone="secondary" />
        <PrimaryButton label="Créer un véhicule" onPress={() => router.push('/vehicules/form')} tone="secondary" />
      </SectionCard>

      <SectionCard title="Mes contrats" subtitle="Contrats rattachés à ton profil assuré.">
        {!assureConnecte ? (
          <Text style={appStyles.subtitle}>Crée d&apos;abord ton profil assuré pour voir tes contrats.</Text>
        ) : contratsUtilisateur.length === 0 ? (
          <Text style={appStyles.subtitle}>Aucun contrat rattaché à ton profil assuré.</Text>
        ) : (
          contratsUtilisateur.map((contrat) => (
            <View key={contrat.id} style={{ gap: 4 }}>
              <Text style={appStyles.fieldValue}>{contrat.numero_contrat || `Contrat #${contrat.id}`}</Text>
              <Text style={appStyles.subtitle}>
                {contrat.type_contrat || 'Type non renseigné'} · {contrat.statut || 'Statut absent'} · Franchise {contrat.franchise ?? 0} EUR
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Mes véhicules" subtitle="Véhicules associés à tes contrats.">
        {!assureConnecte ? (
          <Text style={appStyles.subtitle}>Crée d&apos;abord ton profil assuré pour voir tes véhicules.</Text>
        ) : vehiculesUtilisateur.length === 0 ? (
          <Text style={appStyles.subtitle}>Aucun véhicule rattaché à tes contrats.</Text>
        ) : (
          vehiculesUtilisateur.map((vehicule) => (
            <View key={vehicule.id} style={{ gap: 4 }}>
              <Text style={appStyles.fieldValue}>{vehicule.immatriculation}</Text>
              <Text style={appStyles.subtitle}>
                {[vehicule.marque, vehicule.modele].filter(Boolean).join(' ') || 'Modèle non renseigné'} · Contrat #{vehicule.contrat_id}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Comptes de demo backend" subtitle="Utiles pour tester rapidement l'app mobile sur les roles semes dans le backend.">
        <Text style={appStyles.fieldValue}>clientele@assurmoi.local / client123</Text>
        <Text style={appStyles.fieldValue}>suivi@assurmoi.local / suivi123</Text>
        <Text style={appStyles.fieldValue}>assure@assurmoi.local / assure123</Text>
        <Text style={appStyles.subtitle}>
          `admin@assurmoi.local / admin123` declenche en plus la verification 2FA par email.
        </Text>
      </SectionCard>

      <PrimaryButton label="Se deconnecter" onPress={() => void handleLogout()} tone="ghost" />
    </Screen>
  );
}
