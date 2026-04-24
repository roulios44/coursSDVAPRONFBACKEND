import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Badge, EmptyState, LoadingBlock, PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { deleteSinistre, getErrorMessage, getSinistres } from '@/lib/api';
import { formatDateTime, humanizeStatus } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Sinistre } from '@/types/api';

const FILTERS = ['tous', 'brouillon', 'complet', 'en_cours', 'clos'] as const;

function getBadgeTone(status: string): 'default' | 'success' | 'warning' | 'danger' {
  if (status === 'clos') return 'success';
  if (status === 'en_cours') return 'warning';
  if (status === 'brouillon') return 'danger';
  return 'default';
}

export default function SinistresScreen() {
  const router = useRouter();
  const { token } = useSession();
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSinistres = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getSinistres(token);
      setSinistres(data);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadSinistres();
  }, [loadSinistres]));

  function handleDelete(id: number) {
    if (!token) return;

    Alert.alert('Supprimer le sinistre', 'Cette action est definitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          void deleteSinistre(token, id).then(() => loadSinistres()).catch((deleteError) => {
            setError(getErrorMessage(deleteError));
          });
        },
      },
    ]);
  }

  const items = useMemo(() => {
    if (filter === 'tous') {
      return sinistres;
    }

    return sinistres.filter((item) => item.statut === filter);
  }, [filter, sinistres]);

  if (loading) {
    return (
      <Screen>
        <LoadingBlock label="Chargement des sinistres..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>Sinistres</Text>
        <Text style={appStyles.subtitle}>
          Vue mobile branchée sur `GET /api/sinistres` avec filtrage local par statut.
        </Text>
      </View>

      <PrimaryButton label="Créer un sinistre" onPress={() => router.push('/sinistres/form')} />

      <SectionCard title="Filtres">
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
        <SectionCard title="Erreur backend" subtitle="Le front n'a pas pu recuperer les sinistres.">
          <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text>
          <Text style={appStyles.subtitle}>
            URL utilisee: {process.env.EXPO_PUBLIC_API_BASE_URL || 'variable absente'}
          </Text>
          <PrimaryButton label="Reessayer" onPress={() => void loadSinistres()} />
        </SectionCard>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Aucun sinistre"
          message="Le filtre actif ne remonte aucun resultat depuis l'API."
        />
      ) : (
        items.map((sinistre) => (
          <SectionCard
            key={sinistre.id}
            title={`Sinistre #${sinistre.id}`}
            subtitle={sinistre.vehicule?.immatriculation || 'Vehicule non renseigne'}
            right={<Badge label={humanizeStatus(sinistre.statut)} tone={getBadgeTone(sinistre.statut)} />}>
            <Text style={appStyles.fieldValue}>
              {sinistre.conducteur_prenom} {sinistre.conducteur_nom}
            </Text>
            <Text style={appStyles.subtitle}>{sinistre.contexte}</Text>
            <View style={appStyles.row}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={appStyles.fieldLabel}>Appel</Text>
                <Text style={appStyles.fieldValue}>{formatDateTime(sinistre.date_heure_appel)}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={appStyles.fieldLabel}>Sinistre</Text>
                <Text style={appStyles.fieldValue}>{formatDateTime(sinistre.date_heure_sinistre)}</Text>
              </View>
            </View>
            <View style={appStyles.row}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={appStyles.fieldLabel}>Responsabilite</Text>
                <Text style={appStyles.fieldValue}>
                  {sinistre.responsabilite_engagee ? `${sinistre.pourcentage_responsabilite}%` : '0%'}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={appStyles.fieldLabel}>Createur</Text>
                <Text style={appStyles.fieldValue}>
                  {sinistre.createur ? `${sinistre.createur.prenom} ${sinistre.createur.nom}` : 'Non renseigne'}
                </Text>
              </View>
            </View>
            <View style={appStyles.rowWrap}>
              <PrimaryButton label="Modifier" onPress={() => router.push({ pathname: '/sinistres/form', params: { id: String(sinistre.id) } })} tone="secondary" />
              <PrimaryButton label="Supprimer" onPress={() => handleDelete(sinistre.id)} tone="ghost" />
            </View>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}
