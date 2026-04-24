import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import {
  API_BASE_URL,
  getErrorMessage,
  getUser,
  login,
  logout as logoutRequest,
  verifyTwoFactor as verifyTwoFactorRequest,
} from '@/lib/api';
import type { SessionStatus, User } from '@/types/api';

interface TwoFactorChallenge {
  utilisateurId: number;
  email: string;
}

interface SessionContextValue {
  apiBaseUrl: string;
  challenge: TwoFactorChallenge | null;
  signIn: (email: string, motDePasse: string) => Promise<SessionStatus>;
  signOut: () => Promise<void>;
  status: SessionStatus;
  token: string | null;
  user: User | null;
  verifyTwoFactor: (code: string) => Promise<SessionStatus>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function hydrateUser(token: string, utilisateurId: number) {
  return getUser(token, utilisateurId);
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);

  useEffect(() => {
    setStatus('signed_out');
  }, []);

  async function signIn(email: string, motDePasse: string): Promise<SessionStatus> {
    const response = await login(email.trim(), motDePasse);
    const payload = response.data;

    if ('challenge' in payload) {
      setChallenge({
        utilisateurId: payload.utilisateur_id,
        email: email.trim(),
      });
      setStatus('challenge');
      return 'challenge';
    }

    const nextUser = await hydrateUser(payload.token, payload.utilisateur_id);
    setToken(payload.token);
    setUser(nextUser);
    setChallenge(null);
    setStatus('authenticated');
    return 'authenticated';
  }

  async function verifyTwoFactor(code: string): Promise<SessionStatus> {
    if (!challenge) {
      throw new Error('Aucun challenge 2FA en cours');
    }

    const response = await verifyTwoFactorRequest(challenge.utilisateurId, code.trim());
    const nextUser = await hydrateUser(response.data.token, challenge.utilisateurId);
    setToken(response.data.token);
    setUser(nextUser);
    setChallenge(null);
    setStatus('authenticated');
    return 'authenticated';
  }

  async function signOut() {
    const currentToken = token;

    setToken(null);
    setUser(null);
    setChallenge(null);
    setStatus('signed_out');

    if (!currentToken) {
      return;
    }

    try {
      await logoutRequest(currentToken);
    } catch (error) {
      console.warn('Echec de deconnexion API:', getErrorMessage(error));
    }
  }

  return (
    <SessionContext.Provider
      value={{
        apiBaseUrl: API_BASE_URL,
        challenge,
        signIn,
        signOut,
        status,
        token,
        user,
        verifyTwoFactor,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession doit etre utilise dans SessionProvider');
  }

  return value;
}
