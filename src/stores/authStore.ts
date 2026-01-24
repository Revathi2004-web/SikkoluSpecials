import { create } from 'zustand';
import { Admin, User } from '@/types';
import { storage } from '@/lib/storage';

interface AuthState {
  currentAdmin: Admin | null;
  currentUser: User | null;
  setCurrentAdmin: (admin: Admin | null) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentAdmin: storage.getCurrentAdmin(),
  currentUser: storage.getCurrentUser(),
  
  setCurrentAdmin: (admin) => {
    storage.setCurrentAdmin(admin);
    set({ currentAdmin: admin, currentUser: null });
  },
  
  setCurrentUser: (user) => {
    storage.setCurrentUser(user);
    set({ currentUser: user, currentAdmin: null });
  },
  
  logout: () => {
    storage.setCurrentAdmin(null);
    storage.setCurrentUser(null);
    set({ currentAdmin: null, currentUser: null });
  },
}));
