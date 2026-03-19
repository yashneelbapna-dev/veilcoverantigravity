// Haptic Feedback Hook using Vibration API
export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = (pattern: number | number[]) => {
    if (isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration failed:', e);
      }
    }
  };

  // Light tap - for buttons, selections
  const lightTap = () => vibrate(10);

  // Medium tap - for confirmations, toggles
  const mediumTap = () => vibrate(25);

  // Heavy tap - for errors, important actions
  const heavyTap = () => vibrate(50);

  // Double tap - for likes, favorites
  const doubleTap = () => vibrate([15, 50, 15]);

  // Success pattern - for successful actions
  const success = () => vibrate([30, 50, 30]);

  // Error pattern - for failed actions
  const error = () => vibrate([50, 30, 50, 30, 50]);

  // Add to cart pattern
  const addToCart = () => vibrate([20, 40, 20]);

  // Notification pattern
  const notification = () => vibrate([10, 30, 10, 30]);

  return {
    isSupported,
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    success,
    error,
    addToCart,
    notification,
  };
};

export default useHapticFeedback;
