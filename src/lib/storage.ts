import { Product, Order, Admin, User, ContactNumber, Review, PaymentInfo } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'sikkolu_products',
  ORDERS: 'sikkolu_orders',
  ADMINS: 'sikkolu_admins',
  USERS: 'sikkolu_users',
  CURRENT_USER: 'sikkolu_current_user',
  CURRENT_ADMIN: 'sikkolu_current_admin',
  CONTACT_NUMBERS: 'sikkolu_contact_numbers',
  REVIEWS: 'sikkolu_reviews',
  PAYMENT_INFO: 'sikkolu_payment_info',
};

// Initialize default data
const initializeDefaultData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const defaultProducts: Product[] = [
      {
        id: '1',
        name: 'Kakinada Kaja',
        category: 'sweets',
        price: 350,
        mrp: 450,
        image: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?w=500&h=500&fit=crop',
        description: 'Traditional sweet delicacy from coastal Andhra',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '2',
        name: 'Bamboo Handicrafts',
        category: 'handicrafts',
        price: 450,
        mrp: 550,
        image: 'https://images.unsplash.com/photo-1582735689851-1f6001f07a4b?w=500&h=500&fit=crop',
        description: 'Handcrafted bamboo products by local artisans',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '3',
        name: 'Srikakulam Special Mixture',
        category: 'snacks',
        price: 180,
        mrp: 220,
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&h=500&fit=crop',
        description: 'Crispy traditional mixture with authentic spices',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '4',
        name: 'Handloom Cotton Saree',
        category: 'clothing',
        price: 1200,
        mrp: 1500,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop',
        description: 'Pure handloom cotton saree with traditional designs',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '5',
        name: 'Red Chilli Powder',
        category: 'spices',
        price: 120,
        mrp: 150,
        image: 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500&h=500&fit=crop',
        description: 'Premium quality red chilli powder from local farms',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
      {
        id: '6',
        name: 'Palm Leaf Products',
        category: 'accessories',
        price: 250,
        mrp: 300,
        image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=500&h=500&fit=crop',
        description: 'Eco-friendly palm leaf accessories',
        createdAt: new Date().toISOString(),
        status: 'published',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    const defaultAdmins: Admin[] = [
      {
        id: 'admin1',
        username: 'admin',
        email: 'admin@sikkolaspecials.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(defaultAdmins));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CONTACT_NUMBERS)) {
    const defaultContacts: ContactNumber[] = [
      {
        id: '1',
        label: 'Customer Support',
        number: '+91 9876543210',
        isPrimary: true,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.CONTACT_NUMBERS, JSON.stringify(defaultContacts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_INFO)) {
    const defaultPayments: PaymentInfo[] = [
      {
        id: '1',
        type: 'upi',
        upiId: 'sikkolaspecials@upi',
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VVBJIFFSIENvZGU8L3RleHQ+PC9zdmc+',
        isActive: true,
      },
      {
        id: '2',
        type: 'bank',
        bankName: 'State Bank of India',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        accountHolder: 'Sikkolu Specials',
        isActive: true,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PAYMENT_INFO, JSON.stringify(defaultPayments));
  }
};

initializeDefaultData();

export const storage = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  addProduct: (product: Product) => {
    const products = storage.getProducts();
    products.push(product);
    storage.saveProducts(products);
  },
  
  deleteProduct: (productId: string) => {
    const products = storage.getProducts().filter(p => p.id !== productId);
    storage.saveProducts(products);
  },
  
  updateProduct: (productId: string, updates: Partial<Product>) => {
    const products = storage.getProducts().map(p => 
      p.id === productId ? { ...p, ...updates } : p
    );
    storage.saveProducts(products);
    window.dispatchEvent(new Event('storage'));
  },

  getPublishedProducts: (): Product[] => {
    return storage.getProducts().filter(p => p.status === 'published');
  },

  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  
  addOrder: (order: Order) => {
    const orders = storage.getOrders();
    orders.push(order);
    storage.saveOrders(orders);
  },
  
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    const orders = storage.getOrders().map(o => 
      o.id === orderId ? { ...o, ...updates } : o
    );
    storage.saveOrders(orders);
    window.dispatchEvent(new Event('storage'));
  },

  deleteOrder: (orderId: string) => {
    const orders = storage.getOrders().filter(o => o.id !== orderId);
    storage.saveOrders(orders);
  },

  getUserOrders: (userId: string): Order[] => {
    return storage.getOrders().filter(o => o.userId === userId);
  },

  // Admins
  getAdmins: (): Admin[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ADMINS);
    return data ? JSON.parse(data) : [];
  },
  
  addAdmin: (admin: Admin) => {
    const admins = storage.getAdmins();
    admins.push(admin);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  },
  
  deleteAdmin: (adminId: string) => {
    const admins = storage.getAdmins().filter(a => a.id !== adminId);
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  
  addUser: (user: User) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Auth
  getCurrentAdmin: (): Admin | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentAdmin: (admin: Admin | null) => {
    if (admin) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Contact Numbers
  getContactNumbers: (): ContactNumber[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTACT_NUMBERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveContactNumbers: (contacts: ContactNumber[]) => {
    localStorage.setItem(STORAGE_KEYS.CONTACT_NUMBERS, JSON.stringify(contacts));
  },
  
  addContactNumber: (contact: ContactNumber) => {
    const contacts = storage.getContactNumbers();
    contacts.push(contact);
    storage.saveContactNumbers(contacts);
  },
  
  deleteContactNumber: (contactId: string) => {
    const contacts = storage.getContactNumbers().filter(c => c.id !== contactId);
    storage.saveContactNumbers(contacts);
  },
  
  updateContactNumber: (contactId: string, updates: Partial<ContactNumber>) => {
    const contacts = storage.getContactNumbers().map(c => 
      c.id === contactId ? { ...c, ...updates } : c
    );
    storage.saveContactNumbers(contacts);
  },

  // Reviews
  getReviews: (): Review[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return data ? JSON.parse(data) : [];
  },
  
  saveReviews: (reviews: Review[]) => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  },
  
  addReview: (review: Review) => {
    const reviews = storage.getReviews();
    reviews.push(review);
    storage.saveReviews(reviews);
    
    // Update product rating
    const productReviews = reviews.filter(r => r.productId === review.productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    storage.updateProduct(review.productId, { 
      rating: Math.round(avgRating * 10) / 10, 
      reviewCount: productReviews.length 
    });
  },
  
  getProductReviews: (productId: string): Review[] => {
    return storage.getReviews().filter(r => r.productId === productId);
  },

  // Payment Info
  getPaymentInfo: (): PaymentInfo[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_INFO);
    return data ? JSON.parse(data) : [];
  },
  
  savePaymentInfo: (payments: PaymentInfo[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_INFO, JSON.stringify(payments));
  },
  
  addPaymentInfo: (payment: PaymentInfo) => {
    const payments = storage.getPaymentInfo();
    payments.push(payment);
    storage.savePaymentInfo(payments);
  },
  
  updatePaymentInfo: (paymentId: string, updates: Partial<PaymentInfo>) => {
    const payments = storage.getPaymentInfo().map(p => 
      p.id === paymentId ? { ...p, ...updates } : p
    );
    storage.savePaymentInfo(payments);
  },
  
  deletePaymentInfo: (paymentId: string) => {
    const payments = storage.getPaymentInfo().filter(p => p.id !== paymentId);
    storage.savePaymentInfo(payments);
  },
};
