import { ShoppingBag, UserCircle, LogOut, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

interface HeaderProps {
  onUserLogin: () => void;
  onAdminLogin: () => void;
  onCartClick: () => void;
}

export function Header({ onUserLogin, onAdminLogin, onCartClick }: HeaderProps) {
  const { currentAdmin, currentUser, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h1 className="text-base md:text-xl font-bold text-foreground">Sikkolu Specials</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {currentUser && (
            <>
              <button
                onClick={() => window.location.hash = '#/my-orders'}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="My Orders"
              >
                <Package className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </>
          )}
          
          {currentAdmin ? (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-medium hidden sm:inline">Admin: {currentAdmin.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs md:text-sm font-medium hidden sm:inline">{currentUser.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onUserLogin}>
                <UserCircle className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">User Login</span>
              </Button>
              <Button variant="default" size="sm" onClick={onAdminLogin}>
                <span className="hidden md:inline">Admin Login</span>
                <span className="md:hidden">Admin</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
