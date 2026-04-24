import { Redirect, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';

import { palette } from '@/components/app-ui';
import { useSession } from '@/lib/session';

export default function TabLayout() {
  const { status, token, user } = useSession();

  if (status !== 'authenticated' || !token || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        tabBarActiveTintColor: palette.primaryDark,
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarStyle: {
          backgroundColor: '#FFFDF8',
          borderTopColor: '#E8DED2',
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="space-dashboard" size={size} />,
        }}
      />
      <Tabs.Screen
        name="sinistres"
        options={{
          title: 'Sinistres',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="car-crash" size={size} />,
        }}
      />
      <Tabs.Screen
        name="dossiers"
        options={{
          title: 'Dossiers',
          tabBarIcon: ({ color, size }) => <MaterialIcons color={color} name="folder-copy" size={size} />,
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="account-circle" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
