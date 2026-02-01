export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  image: string;
  description: string;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  status: 'draft' | 'published';
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
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed';
  paymentDate?: string;
  trackingNumber?: string;
  cancellationReason?: string;
  userId?: string;
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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PaymentInfo {
  id: string;
  type: 'upi' | 'bank';
  upiId?: string;
  qrCode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user';
}

export type AuthUser = Admin | User | null;
