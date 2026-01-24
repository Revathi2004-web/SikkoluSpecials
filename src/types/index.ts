export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  quantity: number;
  notes: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin';
  createdAt: string;
}

export interface ContactNumber {
  id: string;
  label: string;
  number: string;
  isPrimary: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user';
}

export type AuthUser = Admin | User | null;
