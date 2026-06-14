import { Alert, Platform } from 'react-native';

export const showAlert = (
  title: string,
  message?: string,
  buttons?: Array<{
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const isConfirm = buttons.length > 1;
      if (isConfirm) {
        const confirmed = window.confirm(`${title}${message ? '\n\n' + message : ''}`);
        if (confirmed) {
          const actionBtn = buttons.find((b) => b.style !== 'cancel') || buttons[0];
          if (actionBtn.onPress) actionBtn.onPress();
        } else {
          const cancelBtn = buttons.find((b) => b.style === 'cancel');
          if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
        }
      } else {
        window.alert(`${title}${message ? '\n\n' + message : ''}`);
        if (buttons[0].onPress) buttons[0].onPress();
      }
    } else {
      window.alert(`${title}${message ? '\n\n' + message : ''}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const CustomAlert = {
  alert: showAlert,
};
