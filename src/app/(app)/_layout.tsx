import { Tabs } from 'expo-router';
import { Text, Image, View } from 'react-native';
import { SL } from '../../components/SystemUI';

function TabIcon({ source, label, focused }: { source: any; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', opacity: focused ? 1 : 0.35 }}>
      <Image 
        source={source} 
        style={{ width: 24, height: 24, marginBottom: 2 }} 
        resizeMode="contain"
      />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#010610',
          borderTopWidth: 1,
          borderTopColor: `${SL.cyan}30`,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: SL.cyan,
        tabBarInactiveTintColor: SL.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quest',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_quest.jpg')} label="Quest" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_status.jpg')} label="Status" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_skills.jpg')} label="Skills" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Loja',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_shop.jpg')} label="Loja" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="penalty"
        options={{
          title: 'Penalty',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_penalty.jpg')} label="Penalty" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Sistema',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../../../assets/images/icons/tab_settings.jpg')} label="Settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
