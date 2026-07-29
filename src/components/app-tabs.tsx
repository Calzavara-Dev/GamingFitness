import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#050B14"
      indicatorColor="#00f0ff"
      labelStyle={{ selected: { color: '#00f0ff' } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Quest</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="skills">
        <NativeTabs.Trigger.Label>Skills</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="status">
        <NativeTabs.Trigger.Label>Status</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="penalty">
        <NativeTabs.Trigger.Label>Penalty</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
