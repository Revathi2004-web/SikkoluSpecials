import { Product, Order, Admin, User, ContactNumber } from '@/types';

const STORAGE_KEYS = {
  PRODUCTS: 'sikkolu_products',
  ORDERS: 'sikkolu_orders',
  ADMINS: 'sikkolu_admins',
  USERS: 'sikkolu_users',
  CURRENT_USER: 'sikkolu_current_user',
  CURRENT_ADMIN: 'sikkolu_current_admin',
  CONTACT_NUMBERS: 'sikkolu_contact_numbers',
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
        image: 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?w=500&h=500&fit=crop',
        description: 'Traditional sweet delicacy from coastal Andhra',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Bamboo Handicrafts',
        category: 'handicrafts',
        price: 450,
        image: 'https://images.unsplash.com/photo-1582735689851-1f6001f07a4b?w=500&h=500&fit=crop',
        description: 'Handcrafted bamboo products by local artisans',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Srikakulam Special Mixture',
        category: 'snacks',
        price: 180,
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&h=500&fit=crop',
        description: 'Crispy traditional mixture with authentic spices',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Handloom Cotton Saree',
        category: 'clothing',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop',
        description: 'Pure handloom cotton saree with traditional designs',
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Red Chilli Powder',
        category: 'spices',
        price: 120,
        image: 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500&h=500&fit=crop',
        description: 'Premium quality red chilli powder from local farms',
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Palm Leaf Products',
        category: 'accessories',
        price: 250,
        image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=500&h=500&fit=crop',
        description: 'Eco-friendly palm leaf accessories',
        createdAt: new Date().toISOString(),
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
  
  deleteOrder: (orderId: string) => {
    const orders = storage.getOrders().filter(o => o.id !== orderId);
    storage.saveOrders(orders);
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
};
