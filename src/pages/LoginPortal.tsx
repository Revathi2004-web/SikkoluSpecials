import { ShoppingBag, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginPortalProps {
  onUserLogin: () => void;
  onAdminLogin: () => void;
}

export function LoginPortal({ onUserLogin, onAdminLogin }: LoginPortalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Sikkolu Specials</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Authentic Srikakulam Products - Traditional Snacks, Sweets & Handicrafts
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Portal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-primary/30 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Customer Portal</h2>
              <p className="text-muted-foreground mb-6">
                Browse authentic Srikakulam products, place orders, and track your purchases
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 w-full">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Browse products by category</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Place orders via contact</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>View order history</span>
                </li>
              </ul>
              <Button onClick={onUserLogin} size="lg" className="w-full">
                <Users className="w-5 h-5 mr-2" />
                Continue as Customer
              </Button>
            </div>
          </div>

          {/* Admin Portal */}
          <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl shadow-xl p-8 border-2 border-primary">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/20 backdrop-blur p-4 rounded-full mb-4">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Admin Portal</h2>
              <p className="text-primary-foreground/90 mb-6">
                Manage products, orders, admins, and contact information
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 w-full">
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Add & delete products</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Manage transaction history</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Control admin accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span>
                  <span>Update contact numbers</span>
                </li>
              </ul>
              <Button 
                onClick={onAdminLogin} 
                size="lg" 
                variant="secondary"
                className="w-full"
              >
                <ShieldCheck className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2026 Sikkolu Specials - Celebrating Srikakulam's Heritage</p>
        </div>
      </div>
    </div>
  );
}
