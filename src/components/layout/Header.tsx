import { ShoppingBag, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  onUserLogin: () => void;
  onAdminLogin: () => void;
}

export function Header({ onUserLogin, onAdminLogin }: HeaderProps) {
  const { currentAdmin, currentUser, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Sikkolu Specials</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {currentAdmin ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Admin: {currentAdmin.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{currentUser.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onUserLogin}>
                <UserCircle className="w-4 h-4 mr-2" />
                User Login
              </Button>
              <Button variant="default" size="sm" onClick={onAdminLogin}>
                Admin Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
