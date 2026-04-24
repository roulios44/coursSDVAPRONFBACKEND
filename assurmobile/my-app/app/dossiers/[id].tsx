import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Badge, EmptyState, LoadingBlock, PrimaryButton, Screen, SectionCard, appStyles } from '@/components/app-ui';
import { getDossier, getErrorMessage, getHistoriques } from '@/lib/api';
import { formatDateTime, humanizeStatus } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { DossierDetail, HistoriqueItem } from '@/types/api';

function getBadgeTone(status: string): 'default' | 'success' | 'warning' | 'danger' {
  if (status === 'clos' || status === 'termine') return 'success';
  if (status.includes('attente') || status === 'en_cours') return 'warning';
  return 'default';
}

export default function DossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [historiques, setHistoriques] = useState<HistoriqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dossierId = useMemo(() => Number(id), [id]);

  const loadDossier = useCallback(async () => {
    if (!token || Number.isNaN(dossierId)) return;

    try {
      setLoading(true);
      const [detail, historiqueData] = await Promise.all([
        getDossier(token, dossierId),
        getHistoriques(token, dossierId),
      ]);
      setDossier(detail);
      setHistoriques(historiqueData);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [dossierId, token]);

  useEffect(() => {
    void loadDossier();
  }, [dossierId, loadDossier, token]);

  if (loading) {
    return (
      <Screen>
        <LoadingBlock label="Chargement du detail du dossier..." />
      </Screen>
    );
  }

  if (error || !dossier) {
    return (
      <Screen>
        <SectionCard title="Impossible d'ouvrir le dossier">
          <Text style={[appStyles.fieldValue, { color: '#A61E4D' }]}>{error || 'Dossier introuvable'}</Text>
          <PrimaryButton label="Recharger" onPress={() => void loadDossier()} />
        </SectionCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionCard
        title={dossier.numero_dossier}
        subtitle={`Sinistre #${dossier.sinistre_id}`}
        right={<Badge label={humanizeStatus(dossier.statut)} tone={getBadgeTone(dossier.statut)} />}>
        <Text style={appStyles.fieldValue}>
          Scenario {humanizeStatus(dossier.scenario)} · Ouvert le {formatDateTime(dossier.date_ouverture)}
        </Text>
        <Text style={appStyles.subtitle}>
          Charge de suivi {dossier.chargeSuivi ? `${dossier.chargeSuivi.prenom} ${dossier.chargeSuivi.nom}` : 'non assigne'} ·
          Gestionnaire {dossier.gestionnaire ? ` ${dossier.gestionnaire.prenom} ${dossier.gestionnaire.nom}` : ' non renseigne'}
        </Text>
      </SectionCard>

      <SectionCard title="Rappel du sinistre">
        <Text style={appStyles.fieldValue}>
          {dossier.sinistre?.conducteur_prenom} {dossier.sinistre?.conducteur_nom}
        </Text>
        <Text style={appStyles.subtitle}>{dossier.sinistre?.contexte || 'Aucun contexte transmis.'}</Text>
        <View style={appStyles.row}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={appStyles.fieldLabel}>Accident</Text>
            <Text style={appStyles.fieldValue}>{formatDateTime(dossier.sinistre?.date_heure_sinistre)}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={appStyles.fieldLabel}>Responsabilite</Text>
            <Text style={appStyles.fieldValue}>
              {dossier.sinistre?.responsabilite_engagee
                ? `${dossier.sinistre?.pourcentage_responsabilite}%`
                : '0%'}
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Etapes du dossier" subtitle="Le backend expose les etapes et leur niveau de validation.">
        {dossier.etapes?.length ? (
          dossier.etapes.map((etape) => (
            <View key={etape.id} style={{ gap: 6 }}>
              <View style={appStyles.row}>
                <Text style={appStyles.fieldValue}>{etape.nom_etape}</Text>
                <Badge label={humanizeStatus(etape.statut)} tone={getBadgeTone(etape.statut)} />
              </View>
              <Text style={appStyles.subtitle}>{etape.commentaire || 'Aucun commentaire sur cette etape.'}</Text>
              <Text style={appStyles.subtitle}>
                Debut {formatDateTime(etape.date_debut)} · Fin {formatDateTime(etape.date_fin)}
              </Text>
              <Text style={appStyles.subtitle}>
                Validation requise: {etape.validation_requise ? 'Oui' : 'Non'} · Effectuee:{' '}
                {etape.validation_effectuee ? 'Oui' : 'Non'}
              </Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="Aucune etape"
            message="Ce dossier n'a pas encore d'etapes de suivi detaillees."
          />
        )}
      </SectionCard>

      <SectionCard title="Documents">
        {dossier.documents?.length ? (
          dossier.documents.map((document) => (
            <View key={document.id} style={{ gap: 4 }}>
              <View style={appStyles.row}>
                <Text style={appStyles.fieldValue}>{document.nom_fichier}</Text>
                <Badge label={document.valide ? 'Valide' : 'En attente'} tone={document.valide ? 'success' : 'warning'} />
              </View>
              <Text style={appStyles.subtitle}>
                {humanizeStatus(document.type_document)} · Depose le {formatDateTime(document.date_depot)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={appStyles.subtitle}>Aucun document rattache a ce dossier.</Text>
        )}
      </SectionCard>

      <SectionCard title="Notifications">
        {dossier.notifications?.length ? (
          dossier.notifications.map((notification) => (
            <View key={notification.id} style={{ gap: 4 }}>
              <Text style={appStyles.fieldValue}>{notification.message}</Text>
              <Text style={appStyles.subtitle}>
                {humanizeStatus(notification.type_notification)} · {formatDateTime(notification.date_envoi)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={appStyles.subtitle}>Aucune notification rattachee a ce dossier.</Text>
        )}
      </SectionCard>

      <SectionCard title="Historique">
        {historiques.length ? (
          historiques.map((historique) => (
            <View key={historique.id} style={{ gap: 4 }}>
              <Text style={appStyles.fieldValue}>{historique.action}</Text>
              <Text style={appStyles.subtitle}>{formatDateTime(historique.date_action)}</Text>
            </View>
          ))
        ) : (
          <Text style={appStyles.subtitle}>Aucune entree d&apos;historique disponible.</Text>
        )}
      </SectionCard>
    </Screen>
  );
}
