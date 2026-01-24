// Order notification management
const NOTIFICATION_KEY = 'sikkolu_last_order_check';

export const notifications = {
  // Get the timestamp of last order check
  getLastOrderCheck: (): number => {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    return stored ? parseInt(stored) : Date.now();
  },

  // Update last order check timestamp
  updateLastOrderCheck: () => {
    localStorage.setItem(NOTIFICATION_KEY, Date.now().toString());
  },

  // Check for new orders since last check
  getNewOrdersCount: (orders: any[]): number => {
    const lastCheck = notifications.getLastOrderCheck();
    return orders.filter(order => 
      new Date(order.orderDate).getTime() > lastCheck
    ).length;
  },

  // Request browser notification permission
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  // Show browser notification
  showNotification: (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sikkolu-order',
        requireInteraction: false,
      });
    }
  },

  // Play notification sound
  playSound: () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore errors if audio can't play
    });
  },
};
