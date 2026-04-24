import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Badge, PrimaryButton, Screen, SectionCard, appStyles, palette } from '@/components/app-ui';
import { ExternalLink } from '@/components/external-link';
import { FormField } from '@/components/form-field';
import { OptionSelector } from '@/components/option-selector';
import {
  createSinistre,
  getPublicFileUrl,
  getAssures,
  getContrats,
  getErrorMessage,
  getSinistre,
  getVehicules,
  uploadSinistreDocument,
  updateSinistre,
} from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Assure, Contrat, DocumentItem, SinistrePayload, Vehicule } from '@/types/api';

const STATUTS = ['brouillon', 'complet', 'en_cours', 'clos'];
const RESPONSABILITES = ['0', '50', '100'];

export default function SinistreFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token, user } = useSession();
  const sinistreId = useMemo(() => (id ? Number(id) : null), [id]);
  const isEditing = Boolean(sinistreId);

  const [contratId, setContratId] = useState('');
  const [vehiculeId, setVehiculeId] = useState('');
  const [assures, setAssures] = useState<Assure[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [conducteurNom, setConducteurNom] = useState('');
  const [conducteurPrenom, setConducteurPrenom] = useState('');
  const [conducteurEstAssure, setConducteurEstAssure] = useState(true);
  const [dateAppel, setDateAppel] = useState(new Date().toISOString());
  const [dateSinistre, setDateSinistre] = useState(new Date().toISOString());
  const [contexte, setContexte] = useState('');
  const [pourcentage, setPourcentage] = useState('0');
  const [statut, setStatut] = useState('brouillon');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assureConnecte = useMemo(
    () => assures.find((assure) => assure.utilisateur_id === user?.id),
    [assures, user?.id],
  );

  const contratsVisibles = useMemo(() => {
    if (!assureConnecte) {
      return contrats;
    }

    return contrats.filter((contrat) => contrat.assure_id === assureConnecte.id);
  }, [assureConnecte, contrats]);

  const vehiculesVisibles = useMemo(() => {
    if (!assureConnecte) {
      return vehicules;
    }

    const contratIds = new Set(contratsVisibles.map((contrat) => contrat.id));
    return vehicules.filter((vehicule) => vehicule.contrat_id && contratIds.has(vehicule.contrat_id));
  }, [assureConnecte, contratsVisibles, vehicules]);

  useEffect(() => {
    async function loadReferences() {
      if (!token) return;

      try {
        const [assuresData, contratsData, vehiculesData] = await Promise.all([
          getAssures(token),
          getContrats(token),
          getVehicules(token),
        ]);

        setAssures(assuresData);
        setContrats(contratsData);
        setVehicules(vehiculesData);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadReferences();
  }, [token]);

  useEffect(() => {
    async function loadSinistre() {
      if (!token || !sinistreId) return;

      try {
        const sinistre = await getSinistre(token, sinistreId);
        setContratId(String(sinistre.contrat_id || ''));
        setVehiculeId(String(sinistre.vehicule_id || ''));
        setConducteurNom(sinistre.conducteur_nom || '');
        setConducteurPrenom(sinistre.conducteur_prenom || '');
        setConducteurEstAssure(Boolean(sinistre.conducteur_est_assure));
        setDateAppel(sinistre.date_heure_appel || new Date().toISOString());
        setDateSinistre(sinistre.date_heure_sinistre || new Date().toISOString());
        setContexte(sinistre.contexte || '');
        setPourcentage(String(sinistre.pourcentage_responsabilite ?? 0));
        setStatut(sinistre.statut || 'brouillon');
        setDocuments(sinistre.documents || []);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }

    void loadSinistre();
  }, [sinistreId, token]);

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: true,
      type: ['application/pdf', 'image/*'],
    });

    if (result.canceled) {
      return;
    }

    setPendingDocuments((current) => [...current, ...result.assets]);
  }

  function removePendingDocument(uri: string) {
    setPendingDocuments((current) => current.filter((item) => item.uri !== uri));
  }

  async function handleSubmit() {
    if (!token || !user) return;
    if (!contratId || !vehiculeId) {
      setError('Selectionne un contrat et un vehicule avant d enregistrer.');
      return;
    }

    const responsibility = Number(pourcentage);
    const payload: SinistrePayload = {
      contrat_id: Number(contratId),
      vehicule_id: Number(vehiculeId),
      cree_par: user.id,
      date_heure_appel: dateAppel,
      date_heure_sinistre: dateSinistre,
      conducteur_nom: conducteurNom,
      conducteur_prenom: conducteurPrenom,
      conducteur_est_assure: conducteurEstAssure,
      contexte,
      responsabilite_engagee: responsibility > 0,
      pourcentage_responsabilite: responsibility,
      statut,
    };

    try {
      setSubmitting(true);
      setError(null);

      let savedSinistre;
      if (isEditing && sinistreId) {
        savedSinistre = await updateSinistre(token, sinistreId, payload);
      } else {
        savedSinistre = await createSinistre(token, payload);
      }

      if (pendingDocuments.length > 0) {
        const uploadedDocuments = await Promise.allSettled(
          pendingDocuments.map((document) => uploadSinistreDocument(token, savedSinistre.id, document)),
        );

        const successfulUploads = uploadedDocuments
          .filter(
            (result): result is PromiseFulfilledResult<DocumentItem> => result.status === 'fulfilled',
          )
          .map((result) => result.value);

        if (successfulUploads.length > 0) {
          setDocuments((current) => [...current, ...successfulUploads]);
          setPendingDocuments([]);
        }

        if (uploadedDocuments.some((result) => result.status === 'rejected')) {
          Alert.alert(
            'Sinistre enregistre',
            "Le sinistre a bien ete enregistre, mais au moins un document n'a pas pu etre envoye.",
          );
        }
      }

      router.replace('/(tabs)/sinistres');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={appStyles.title}>{isEditing ? 'Modifier le sinistre' : 'Nouveau sinistre'}</Text>
        <Text style={appStyles.subtitle}>
          Selectionne un vehicule et son contrat depuis les donnees disponibles dans l API.
        </Text>
      </View>

      <SectionCard title="Informations principales">
        <View style={appStyles.rowWrap}>
          <PrimaryButton label="Créer profil assuré" onPress={() => router.push('/assures/form')} tone="secondary" />
          <PrimaryButton label="Créer contrat" onPress={() => router.push('/contrats/form')} tone="secondary" />
          <PrimaryButton label="Créer véhicule" onPress={() => router.push('/vehicules/form')} tone="secondary" />
        </View>
        <OptionSelector
          emptyMessage="Aucun contrat disponible pour cet utilisateur."
          label="Contrat"
          onChange={(value) => setContratId(String(value))}
          options={contratsVisibles.map((contrat) => ({
            label: contrat.numero_contrat || `Contrat #${contrat.id}`,
            subtitle: `${contrat.type_contrat || 'Type non renseigne'} · Assure #${contrat.assure_id}`,
            value: contrat.id,
          }))}
          value={contratId ? Number(contratId) : null}
        />
        <OptionSelector
          emptyMessage="Aucun vehicule disponible pour cet utilisateur."
          label="Vehicule"
          onChange={(value) => {
            const selected = vehicules.find((vehicule) => vehicule.id === value);
            setVehiculeId(String(value));
            if (selected?.contrat_id) {
              setContratId(String(selected.contrat_id));
            }
          }}
          options={vehiculesVisibles.map((vehicule) => ({
            label: `${vehicule.immatriculation} · ${vehicule.marque || ''} ${vehicule.modele || ''}`.trim(),
            subtitle: `Contrat #${vehicule.contrat_id}${vehicule.valeur_argus ? ` · Argus ${vehicule.valeur_argus} EUR` : ''}`,
            value: vehicule.id,
          }))}
          value={vehiculeId ? Number(vehiculeId) : null}
        />
        <FormField label="Nom conducteur" onChangeText={setConducteurNom} value={conducteurNom} />
        <FormField label="Prenom conducteur" onChangeText={setConducteurPrenom} value={conducteurPrenom} />
        <Pressable
          onPress={() => setConducteurEstAssure((value) => !value)}
          style={{ backgroundColor: '#FBF6F0', borderRadius: 16, padding: 14 }}>
          <Text style={{ color: palette.ink, fontWeight: '800' }}>
            Conducteur assure: {conducteurEstAssure ? 'Oui' : 'Non'}
          </Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Dates et contexte">
        <FormField label="Date/heure appel ISO" onChangeText={setDateAppel} value={dateAppel} />
        <FormField label="Date/heure sinistre ISO" onChangeText={setDateSinistre} value={dateSinistre} />
        <FormField label="Contexte" multiline onChangeText={setContexte} value={contexte} />
      </SectionCard>

      <SectionCard
        title="Documents"
        subtitle="Ajoute des justificatifs du sinistre. Les fichiers sont envoyes au backend et stockes dans le dossier files.">
        <Pressable
          onPress={() => void handlePickDocument()}
          style={{
            backgroundColor: '#FBF6F0',
            borderColor: '#C26A3D',
            borderRadius: 18,
            borderStyle: 'dashed',
            borderWidth: 2,
            minHeight: 110,
            padding: 18,
          }}>
          <View style={{ alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Text style={[appStyles.fieldValue, { textAlign: 'center' }]}>Zone de depot de documents</Text>
            <Text style={[appStyles.subtitle, { textAlign: 'center' }]}>
              Clique ici pour selectionner un PDF ou une image depuis le PC de l utilisateur.
            </Text>
          </View>
        </Pressable>

        {pendingDocuments.length ? (
          <View style={{ gap: 10 }}>
            <Text style={appStyles.fieldLabel}>Documents en attente</Text>
            {pendingDocuments.map((document) => (
              <View
                key={document.uri}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FBF6F0',
                  borderRadius: 16,
                  flexDirection: 'row',
                  gap: 10,
                  justifyContent: 'space-between',
                  padding: 14,
                }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={appStyles.fieldValue}>{document.name}</Text>
                  <Text style={appStyles.subtitle}>
                    {document.mimeType || 'Type inconnu'}
                    {document.size ? ` · ${Math.round(document.size / 1024)} Ko` : ''}
                  </Text>
                </View>
                <PrimaryButton
                  label="Retirer"
                  onPress={() => removePendingDocument(document.uri)}
                  tone="ghost"
                />
              </View>
            ))}
          </View>
        ) : null}

        {documents.length ? (
          <View style={{ gap: 10 }}>
            <Text style={appStyles.fieldLabel}>Documents deja rattaches</Text>
            {documents.map((document) => (
              <View
                key={document.id}
                style={{
                  backgroundColor: '#FBF6F0',
                  borderRadius: 16,
                  flexDirection: 'row',
                  gap: 10,
                  justifyContent: 'space-between',
                  padding: 14,
                }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={appStyles.fieldValue}>{document.nom_fichier}</Text>
                  <Text style={appStyles.subtitle}>{document.chemin_fichier || 'Chemin non disponible'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Badge label={document.valide ? 'Valide' : 'Stocke'} tone={document.valide ? 'success' : 'default'} />
                  {getPublicFileUrl(document.chemin_fichier) ? (
                    <ExternalLink
                      href={getPublicFileUrl(document.chemin_fichier)!}
                      style={{
                        backgroundColor: '#C26A3D',
                        borderRadius: 999,
                        color: '#FFF8F1',
                        fontSize: 13,
                        fontWeight: '800',
                        overflow: 'hidden',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        textAlign: 'center',
                      }}>
                      Visualiser
                    </ExternalLink>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </SectionCard>

      <SectionCard title="Statut et responsabilite">
        <View style={appStyles.rowWrap}>
          {RESPONSABILITES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setPourcentage(item)}
              style={{
                backgroundColor: pourcentage === item ? '#C26A3D' : '#FBF6F0',
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text style={{ color: pourcentage === item ? '#FFF8F1' : palette.ink, fontWeight: '800' }}>
                {item}%
              </Text>
            </Pressable>
          ))}
        </View>
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
      <PrimaryButton
        disabled={submitting}
        label={submitting ? 'Enregistrement...' : 'Enregistrer'}
        onPress={() => void handleSubmit()}
      />
    </Screen>
  );
}
