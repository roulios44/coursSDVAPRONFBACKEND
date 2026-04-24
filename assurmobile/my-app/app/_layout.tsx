import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { palette } from '@/components/app-ui';
import { SessionProvider, useSession } from '@/lib/session';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { status, token, user } = useSession();

  if (status === 'loading') {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: palette.bg,
          flex: 1,
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={palette.primaryDark} size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        {status === 'authenticated' && token && user ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="dossiers/[id]"
              options={{
                title: 'Suivi du dossier',
                headerLargeTitle: false,
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="sinistres/form"
              options={{
                title: 'Sinistre',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="dossiers/form"
              options={{
                title: 'Dossier',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="assures/form"
              options={{
                title: 'Profil assuré',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="contrats/form"
              options={{
                title: 'Contrat',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="vehicules/form"
              options={{
                title: 'Véhicule',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen
              name="register"
              options={{
                title: 'Creer un compte',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="verify-2fa"
              options={{
                title: 'Double authentification',
                headerTintColor: palette.ink,
                headerStyle: { backgroundColor: palette.bg },
                headerShadowVisible: false,
              }}
            />
          </>
        )}
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}
