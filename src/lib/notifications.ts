import { Order } from '@/types';

const LAST_CHECK_KEY = 'last_order_check_timestamp';

export const notifications = {
  // Browser permission adagadaniki
  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Kotha order vachinapudu sound play cheyadaniki
  playSound: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.play().catch(err => console.log('Audio blocked:', err));
  },

  // Desktop notification chupinchadaniki
  showNotification: (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  },

  // Kotha orders count check cheyadaniki
  getNewOrdersCount: (orders: Order[]) => {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheck) return 0;
    const lastCheckDate = new Date(lastCheck);
    return orders.filter(order => new Date(order.orderDate) > lastCheckDate).length;
  },

  // Admin orders chusinapudu timestamp update cheyadaniki
  updateLastOrderCheck: () => {
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  }
};
