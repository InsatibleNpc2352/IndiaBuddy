import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const registerPushToken = async () => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const hasPermission = await requestPermissions();
  if (hasPermission) {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    // Call backend API to register token
    console.log('Push token:', token);
    return token;
  }
  return null;
};

export const scheduleLocalAlert = async (route: string, targetPrice: number, currentPrice: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Price Alert! 🚨",
      body: `Price for ${route} has dropped to ₹${currentPrice} (Target: ₹${targetPrice})`,
      data: { route },
    },
    trigger: null, // Send immediately
  });
};
