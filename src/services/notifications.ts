import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return false;
  
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00ff88',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  return true;
}

export async function scheduleMidnightWarningNotification() {
  if (Platform.OS === 'web') return;

  // Cancela qualquer notificação anterior para não acumular
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Agenda para as 22:00 de hoje
  const trigger = new Date();
  trigger.setHours(22, 0, 0, 0);

  // Se já passou das 22h, agenda pro dia seguinte
  if (trigger.getTime() < new Date().getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "SISTEMA ⚔️",
      body: "Faltam 2 horas para a meia-noite, Caçador. A Penalty Zone aguarda...",
      sound: true,
      color: '#00ff88',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

export async function cancelMidnightWarningNotification() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
