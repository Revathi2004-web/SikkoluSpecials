import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { LoginPortal } from '@/pages/LoginPortal';
import { LoginForm } from '@/components/forms/LoginForm';
import { Cart } from '@/components/features/Cart';
import { ChatBot } from '@/components/features/ChatBot';
import { MyOrders } from '@/pages/MyOrders';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from '@/components/ui/toaster';

export default function App() {
  const { currentAdmin, currentUser } = useAuthStore();
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'orders'>('home');

  // Listen for hash changes to handle routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#/my-orders') {
      setCurrentPage('orders');
    } else {
      setCurrentPage('home');
    }
  });

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
      
      {currentAdmin ? (
        <AdminDashboard />
      ) : currentPage === 'orders' ? (
        <MyOrders />
      ) : (
        <HomePage />
      )}

      {/* Show chatbot only for users, not admins */}
      {currentUser && <ChatBot />}

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
