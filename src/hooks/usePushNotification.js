import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export const usePushNotification = () => {
  useEffect(() => {
    // ✅ 네이티브 플랫폼에서만 실행
    if (!Capacitor.isNativePlatform()) {
      console.log('📴 웹에서는 푸시 알림을 설정하지 않습니다.');
      return;
    }

    PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener('registration', token => {
      console.log('📲 FCM Token:', token.value);
      // 서버로 토큰 전송 등
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('❌ Push registration error', err);
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('🔔 Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('📨 Push tapped:', action);
    });
  }, []);
};
