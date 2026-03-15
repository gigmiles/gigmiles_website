import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from './platform';

export const haptics = {
  light: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },
  
  medium: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },
  
  heavy: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },
  
  success: async () => {
    if (isNative) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  },
  
  error: async () => {
    if (isNative) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  },
  
  warning: async () => {
    if (isNative) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  },
};
