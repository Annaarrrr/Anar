import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';

// Configure how notifications are handled when the app is open/active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(userId: string): Promise<void> {
  let token = '';

  if (Platform.OS === 'web') {
    console.log('[PushNotifications] Running on Web. Simulating token registration.');
    // Generate a browser-specific mock token for local testing
    token = `web_mock_token_${userId.substring(0, 8)}_${Math.random().toString(36).substring(2, 10)}`;
    try {
      await api.registerPushToken(token);
      console.log('[PushNotifications] Web mock token registered successfully:', token);
    } catch (error) {
      console.error('[PushNotifications] Failed to register web mock token:', error);
    }
    return;
  }

  if (!Device.isDevice) {
    console.log('[PushNotifications] Running on simulator. Simulating token registration.');
    token = `simulator_mock_token_${userId.substring(0, 8)}_${Math.random().toString(36).substring(2, 10)}`;
    try {
      await api.registerPushToken(token);
      console.log('[PushNotifications] Simulator mock token registered successfully:', token);
    } catch (error) {
      console.error('[PushNotifications] Failed to register simulator mock token:', error);
    }
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PushNotifications] Permission not granted for push notifications.');
      return;
    }

    // Fetch the Expo push token
    try {
      const expoTokenResponse = await Notifications.getExpoPushTokenAsync();
      token = expoTokenResponse.data;
      console.log('[PushNotifications] Acquired Expo Push Token:', token);
    } catch (tokenError) {
      console.warn('[PushNotifications] Failed to get real push token (missing FCM credentials). Using mock token fallback.');
      token = `native_mock_token_${userId.substring(0, 8)}_${Math.random().toString(36).substring(2, 10)}`;
    }

    await api.registerPushToken(token);
    console.log('[PushNotifications] Token registered successfully on backend:', token);
  } catch (error) {
    console.error('[PushNotifications] Error setting up push notifications:', error);
  }
}
