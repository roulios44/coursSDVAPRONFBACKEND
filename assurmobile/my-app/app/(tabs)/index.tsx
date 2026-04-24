import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, Text, View } from 'react-native';

import { EmptyState, LoadingBlock, Metric, PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { getDossiers, getErrorMessage, getNotifications, getSinistres } from '@/lib/api';
import { formatDateTime, humanizeStatus, initials } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Dossier, NotificationItem, Sinistre } from '@/types/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { token, user } = useSession();
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [sinistresData, dossiersData, notificationsData] = await Promise.all([
        getSinistres(token),
        getDossiers(token),
        getNotifications(token),
      ]);
      setSinistres(sinistresData);
      setDossiers(dossiersData);
      setNotifications(notificationsData);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, token]);

  if (loading) {
    return (
      <Screen>
        <LoadingBlock label="Connexion au backend AssurMoi..." />
      </Screen>
    );
  }

  const dossiersActifs = dossiers.filter((item) => item.statut !== 'clos');
  const sinistresComplets = sinistres.filter((item) => item.statut === 'complet');
  const notificationsRecentes = [...notifications]
    .sort((a, b) => (b.date_envoi || '').localeCompare(a.date_envoi || ''))
    .slice(0, 3);

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void loadDashboard(true)} />
      }>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>AssurMoi</Text>
        <Text style={appStyles.subtitle}>
          {user ? `${user.prenom} ${user.nom}` : 'Equipe mobile'} · {user?.role_nom || 'Collaborateur'}
        </Text>
      </View>

      <SectionCard title="Vue d'ensemble" subtitle="Donnees recuperees en direct depuis le backend Express.">
        <View style={appStyles.rowWrap}>
          <Metric label="Sinistres" value={sinistres.length} hint={`${sinistresComplets.length} complets`} />
          <Metric label="Dossiers actifs" value={dossiersActifs.length} hint={`${dossiers.length} au total`} />
        </View>
      </SectionCard>

      <SectionCard
        title="Actions prioritaires"
        subtitle="Les dossiers en attente ou necessitant un suivi sont remontes ici."
        right={<Text style={appStyles.fieldLabel}>{formatDateTime(new Date().toISOString())}</Text>}>
        {error ? (
          <View style={{ gap: 10 }}>
            <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error}</Text>
            <Text style={appStyles.subtitle}>
              URL utilisee: {process.env.EXPO_PUBLIC_API_BASE_URL || 'variable absente'}
            </Text>
            <PrimaryButton label="Reessayer" onPress={() => void loadDashboard()} />
          </View>
        ) : dossiersActifs.length > 0 ? (
          dossiersActifs.slice(0, 2).map((dossier) => (
            <View key={dossier.id} style={{ gap: 10 }}>
              <Text style={appStyles.fieldLabel}>{dossier.numero_dossier}</Text>
              <Text style={appStyles.fieldValue}>
                {humanizeStatus(dossier.statut)} · {humanizeStatus(dossier.scenario)}
              </Text>
              <PrimaryButton label="Ouvrir le dossier" onPress={() => router.push(`/dossiers/${dossier.id}`)} tone="secondary" />
            </View>
          ))
        ) : (
          <EmptyState
            title="Aucun dossier prioritaire"
            message="Le backend ne remonte actuellement aucun dossier actif pour cette session."
          />
        )}
      </SectionCard>

      <SectionCard title="Dernieres notifications" subtitle="Emails et notifications pousses par l'API.">
        {notificationsRecentes.length === 0 ? (
          <Text style={appStyles.subtitle}>Aucune notification disponible.</Text>
        ) : (
          notificationsRecentes.map((notification) => (
            <View key={notification.id} style={{ gap: 4 }}>
              <Text style={appStyles.fieldValue}>{notification.message}</Text>
              <Text style={appStyles.subtitle}>
                {humanizeStatus(notification.type_notification)} · {formatDateTime(notification.date_envoi)}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Compte connecte" subtitle="Contexte de la session utilisee pour securiser les appels API.">
        <Text style={appStyles.fieldValue}>
          {initials(user?.prenom, user?.nom)} · {user?.email}
        </Text>
        <Text style={appStyles.subtitle}>Tire pour rafraichir ou consulte les onglets Sinistres et Dossiers.</Text>
      </SectionCard>
    </Screen>
  );
}
