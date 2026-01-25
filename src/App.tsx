import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { LoginPortal } from '@/pages/LoginPortal';
import { LoginForm } from '@/components/forms/LoginForm';
import { Cart } from '@/components/features/Cart';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  const { currentAdmin, currentUser } = useAuthStore();
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Show login portal if no user is logged in
  if (!currentAdmin && !currentUser) {
    return (
      <>
        <LoginPortal
          onUserLogin={() => setShowUserLogin(true)}
          onAdminLogin={() => setShowAdminLogin(true)}
        />
        
        {showUserLogin && (
          <LoginForm type="user" onClose={() => setShowUserLogin(false)} />
        )}
        
        {showAdminLogin && (
          <LoginForm type="admin" onClose={() => setShowAdminLogin(false)} />
        )}

        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onUserLogin={() => setShowUserLogin(true)}
        onAdminLogin={() => setShowAdminLogin(true)}
        onCartClick={() => setShowCart(true)}
      />
      
      {currentAdmin ? <AdminDashboard /> : <HomePage />}

      {showUserLogin && (
        <LoginForm type="user" onClose={() => setShowUserLogin(false)} />
      )}
      
      {showAdminLogin && (
        <LoginForm type="admin" onClose={() => setShowAdminLogin(false)} />
      )}

      {showCart && <Cart onClose={() => setShowCart(false)} />}

      <Toaster />
    </div>
  );
}
