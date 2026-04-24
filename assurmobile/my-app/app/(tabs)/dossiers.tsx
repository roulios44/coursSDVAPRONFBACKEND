import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Badge, EmptyState, LoadingBlock, PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { deleteDossier, getDossiers, getErrorMessage } from '@/lib/api';
import { formatDateTime, humanizeStatus } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Dossier } from '@/types/api';

const FILTERS = ['tous', 'initialise', 'en_attente_expertise', 'en_cours', 'reglement_realise', 'clos'] as const;

function getBadgeTone(status: string): 'default' | 'success' | 'warning' | 'danger' {
  if (status === 'clos') return 'success';
  if (status === 'reglement_realise' || status === 'en_attente_expertise') return 'warning';
  if (status === 'initialise') return 'danger';
  return 'default';
}

export default function DossiersScreen() {
  const router = useRouter();
  const { token } = useSession();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDossiers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getDossiers(token);
      setDossiers(data);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadDossiers();
  }, [loadDossiers]));

  function handleDelete(id: number) {
    if (!token) return;

    Alert.alert('Supprimer le dossier', 'Cette action est definitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          void deleteDossier(token, id).then(() => loadDossiers()).catch((deleteError) => {
            setError(getErrorMessage(deleteError));
          });
        },
      },
    ]);
  }

  const items = useMemo(() => {
    if (filter === 'tous') {
      return dossiers;
    }

    return dossiers.filter((item) => item.statut === filter);
  }, [dossiers, filter]);

  if (loading) {
    return (
      <Screen>
        <LoadingBlock label="Chargement des dossiers..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Dossiers</Text>
        <Text style={appStyles.subtitle}>
          Liste issue de `GET /api/dossiers` avec acces au detail complet du suivi.
        </Text>
      </View>

      <PrimaryButton label="Créer un dossier" onPress={() => router.push('/dossiers/form')} />

      <SectionCard title="Filtrer le suivi">
        <View style={appStyles.rowWrap}>
          {FILTERS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={{
                backgroundColor: filter === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text
                style={{
                  color: filter === item ? '#FFF8F1' : '#14213D',
                  fontSize: 13,
                  fontWeight: '800',
                }}>
                {humanizeStatus(item)}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      {error ? (
        <SectionCard title="Erreur backend" subtitle="Le front n'a pas pu recuperer les dossiers.">
          <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text>
          <Text style={appStyles.subtitle}>
            URL utilisee: {process.env.EXPO_PUBLIC_API_BASE_URL || 'variable absente'}
          </Text>
          <PrimaryButton label="Reessayer" onPress={() => void loadDossiers()} />
        </SectionCard>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Aucun dossier disponible"
          message="L'API ne remonte rien pour le filtre en cours."
        />
      ) : (
        items.map((dossier) => (
          <SectionCard
            key={dossier.id}
            title={dossier.numero_dossier}
            subtitle={`Scenario ${humanizeStatus(dossier.scenario)}`}
            right={<Badge label={humanizeStatus(dossier.statut)} tone={getBadgeTone(dossier.statut)} />}>
            <View style={appStyles.row}>
              <View style={appStyles.splitItem}>
                <Text style={appStyles.fieldLabel}>Ouverture</Text>
                <Text style={appStyles.fieldValue}>{formatDateTime(dossier.date_ouverture)}</Text>
              </View>
              <View style={appStyles.splitItem}>
                <Text style={appStyles.fieldLabel}>Charge suivi</Text>
                <Text style={appStyles.fieldValue}>
                  {dossier.chargeSuivi ? `${dossier.chargeSuivi.prenom} ${dossier.chargeSuivi.nom}` : 'Non assigne'}
                </Text>
              </View>
            </View>
            <Text style={appStyles.subtitle}>
              Sinistre associe #{dossier.sinistre_id} · Gestionnaire{' '}
              {dossier.gestionnaire ? `${dossier.gestionnaire.prenom} ${dossier.gestionnaire.nom}` : 'non renseigne'}
            </Text>
            <PrimaryButton label="Consulter le suivi" onPress={() => router.push(`/dossiers/${dossier.id}`)} />
            <View style={appStyles.rowWrap}>
              <PrimaryButton label="Modifier" onPress={() => router.push({ pathname: '/dossiers/form', params: { id: String(dossier.id) } })} tone="secondary" />
              <PrimaryButton label="Supprimer" onPress={() => handleDelete(dossier.id)} tone="ghost" />
            </View>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}
