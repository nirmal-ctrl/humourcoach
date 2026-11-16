import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7B847E',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 1 },
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 9,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={typeof color === 'string' ? color : colors.muted} name={focused ? 'home' : 'home-outline'} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={typeof color === 'string' ? color : colors.muted} name={focused ? 'book' : 'book-outline'} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={typeof color === 'string' ? color : colors.muted} name={focused ? 'stats-chart' : 'stats-chart-outline'} size={23} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={typeof color === 'string' ? color : colors.muted} name={focused ? 'person' : 'person-outline'} size={23} />
          ),
        }}
      />
    </Tabs>
  );
}
