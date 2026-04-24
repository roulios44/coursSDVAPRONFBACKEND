import Constants from "expo-constants";
import { Platform } from "react-native";
import type { DocumentPickerAsset } from "expo-document-picker";

import type {
  ApiEnvelope,
  Assure,
  AssurePayload,
  AuthChallenge,
  AuthSuccess,
  Contrat,
  ContratPayload,
  Dossier,
  DossierDetail,
  DossierPayload,
  DocumentItem,
  HistoriqueItem,
  NotificationItem,
  RegisterPayload,
  Sinistre,
  SinistrePayload,
  User,
  Vehicule,
  VehiculePayload,
} from "@/types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

type ExpoConstantsShape = {
  expoConfig?: { hostUri?: string };
  manifest?: { debuggerHost?: string };
  manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function sanitizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const envApiBaseUrl = sanitizeBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "",
);
const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 8000);

export function getApiBaseUrl() {
  if (envApiBaseUrl && envApiBaseUrl.toLowerCase() !== "auto") {
    return envApiBaseUrl;
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  const constants = Constants as unknown as ExpoConstantsShape;
  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

export const API_BASE_URL = getApiBaseUrl();

export function getPublicFileUrl(filePath?: string | null) {
  if (!filePath) {
    return null;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const publicBaseUrl = API_BASE_URL.replace(/\/api$/, "");
  return `${publicBaseUrl}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return (await response.json()) as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;

  try {
    console.log(`${API_BASE_URL}${path}`);
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        `Delai depasse pour joindre ${API_BASE_URL}. Verifie que le backend repond bien et que l'URL du .env est accessible depuis l'app.`,
        408,
      );
    }

    throw new ApiError(
      `Impossible de joindre ${API_BASE_URL}. Verifie l'adresse du backend dans le .env et le reseau utilise par Expo.`,
      0,
      error,
    );
  }

  clearTimeout(timeoutId);

  if (response.status === 204) {
    return { data: null as T };
  }

  const json = await parseJson<ApiEnvelope<T> & { message?: string }>(response);

  if (!response.ok) {
    throw new ApiError(
      json?.message || `Erreur API (${response.status})`,
      response.status,
      json ?? null,
    );
  }

  if (!json) {
    throw new ApiError("Reponse API invalide", response.status);
  }

  return json;
}

export function login(email: string, motDePasse: string) {
  return apiRequest<AuthChallenge | AuthSuccess>("/auth/login", {
    method: "POST",
    body: { email, mot_de_passe: motDePasse },
  });
}

export function verifyTwoFactor(utilisateurId: number, code: string) {
  return apiRequest<AuthSuccess>("/auth/2fa/verify", {
    method: "POST",
    body: { utilisateur_id: utilisateurId, code },
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<User>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function logout(token: string) {
  return apiRequest<null>("/auth/logout", {
    method: "POST",
    token,
  });
}

export async function getUser(token: string, id: number) {
  const response = await apiRequest<User>(`/users/${id}`, { token });
  return response.data;
}

export async function getUsers(token: string) {
  const response = await apiRequest<User[]>("/users", { token });
  return response.data;
}

export async function getAssures(token: string) {
  const response = await apiRequest<Assure[]>("/assures", { token });
  return response.data;
}

export async function createAssure(token: string, payload: AssurePayload) {
  const response = await apiRequest<Assure>("/assures", {
    method: "POST",
    token,
    body: payload,
  });
  return response.data;
}

export async function getContrats(token: string) {
  const response = await apiRequest<Contrat[]>("/contrats", { token });
  return response.data;
}

export async function createContrat(token: string, payload: ContratPayload) {
  const response = await apiRequest<Contrat>("/contrats", {
    method: "POST",
    token,
    body: payload,
  });
  return response.data;
}

export async function getVehicules(token: string) {
  const response = await apiRequest<Vehicule[]>("/vehicules", { token });
  return response.data;
}

export async function createVehicule(token: string, payload: VehiculePayload) {
  const response = await apiRequest<Vehicule>("/vehicules", {
    method: "POST",
    token,
    body: payload,
  });
  return response.data;
}

export async function getSinistres(token: string) {
  const response = await apiRequest<Sinistre[]>("/sinistres", { token });
  return response.data;
}

export async function getSinistre(token: string, id: number) {
  const response = await apiRequest<Sinistre>(`/sinistres/${id}`, { token });
  return response.data;
}

export async function createSinistre(token: string, payload: SinistrePayload) {
  const response = await apiRequest<Sinistre>("/sinistres", {
    method: "POST",
    token,
    body: payload,
  });
  return response.data;
}

export async function updateSinistre(token: string, id: number, payload: SinistrePayload) {
  const response = await apiRequest<Sinistre>(`/sinistres/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response.data;
}

export async function uploadSinistreDocument(
  token: string,
  sinistreId: number,
  document: DocumentPickerAsset,
  typeDocument = "piece_jointe",
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const formData = new FormData();

  formData.append("type_document", typeDocument);

  if (Platform.OS === "web" && document.file) {
    formData.append("file", document.file, document.name);
  } else {
    formData.append("file", {
      uri: document.uri,
      name: document.name,
      type: document.mimeType || "application/octet-stream",
    } as unknown as Blob);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/sinistres/${sinistreId}/documents`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Delai depasse pendant l'envoi du document.", 408);
    }

    throw new ApiError("Impossible d'envoyer le document au backend.", 0, error);
  }

  clearTimeout(timeoutId);

  const json = await parseJson<ApiEnvelope<DocumentItem> & { message?: string }>(response);

  if (!response.ok) {
    throw new ApiError(
      json?.message || `Erreur API (${response.status})`,
      response.status,
      json ?? null,
    );
  }

  if (!json) {
    throw new ApiError("Reponse API invalide", response.status);
  }

  return json.data;
}

export async function deleteSinistre(token: string, id: number) {
  await apiRequest<null>(`/sinistres/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getDossiers(token: string) {
  const response = await apiRequest<Dossier[]>("/dossiers", { token });
  return response.data;
}

export async function createDossier(token: string, payload: DossierPayload) {
  const response = await apiRequest<Dossier>("/dossiers", {
    method: "POST",
    token,
    body: payload,
  });
  return response.data;
}

export async function updateDossier(token: string, id: number, payload: DossierPayload) {
  const response = await apiRequest<Dossier>(`/dossiers/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response.data;
}

export async function deleteDossier(token: string, id: number) {
  await apiRequest<null>(`/dossiers/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function getDossier(token: string, id: number) {
  const response = await apiRequest<DossierDetail>(`/dossiers/${id}`, {
    token,
  });
  return response.data;
}

export async function getNotifications(token: string) {
  const response = await apiRequest<NotificationItem[]>("/notifications", {
    token,
  });
  return response.data;
}

export async function getHistoriques(token: string, dossierId: number) {
  const response = await apiRequest<HistoriqueItem[]>(
    `/historiques?dossier_id=${encodeURIComponent(String(dossierId))}`,
    { token },
  );
  return response.data;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inattendue est survenue";
}
