import { Keyboard } from '@capacitor/keyboard';
import { isNative } from './platform';

export const keyboard = {
  hide: async () => {
    if (isNative) {
      await Keyboard.hide();
    }
  },
  
  show: async () => {
    if (isNative) {
      await Keyboard.show();
    }
  },
  
  // Listen for keyboard events
  addListener: (callback: (info: { keyboardHeight: number }) => void) => {
    if (isNative) {
      Keyboard.addListener('keyboardWillShow', callback);
      Keyboard.addListener('keyboardWillHide', () => callback({ keyboardHeight: 0 }));
    }
  },
};
