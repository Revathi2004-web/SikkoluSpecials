import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { User, Admin } from '@/types';

interface LoginFormProps {
  type: 'user' | 'admin';
  onClose: () => void;
}

export function LoginForm({ type, onClose }: LoginFormProps) {
  const { toast } = useToast();
  const { setCurrentAdmin, setCurrentUser } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'admin') {
      const admins = storage.getAdmins();
      
      if (isSignup) {
        // Check if username already exists
        const existingAdmin = admins.find(a => a.username === formData.username);
        if (existingAdmin) {
          toast({ title: 'Username already exists', variant: 'destructive' });
          return;
        }
        
        // Create new admin (only if logged in as admin)
        const currentAdmin = storage.getCurrentAdmin();
        if (!currentAdmin) {
          toast({ title: 'Only admins can create new admin accounts', variant: 'destructive' });
          return;
        }
        
        const newAdmin: Admin = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        storage.addAdmin(newAdmin);
        toast({ title: 'New admin account created successfully!' });
        onClose();
      } else {
        // Admin login with password verification
        const admin = admins.find(
          a => a.username === formData.username && a.password === formData.password
        );
        
        if (admin) {
          setCurrentAdmin(admin);
          toast({ title: `Welcome ${admin.username}!` });
          onClose();
        } else {
          toast({ title: 'Invalid username or password', variant: 'destructive' });
        }
      }
    } else {
      // User login/signup
      const users = storage.getUsers();
      const user = users.find(u => u.email === formData.email);

      if (user) {
        setCurrentUser(user);
        toast({ title: `Welcome back, ${user.name}!` });
        onClose();
      } else if (isSignup) {
        const newUser: User = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'user',
        };
        storage.addUser(newUser);
        setCurrentUser(newUser);
        toast({ title: 'Account created successfully!' });
        onClose();
      } else {
        toast({ title: 'User not found. Please sign up.', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {type === 'admin' ? 'Admin' : 'User'} {isSignup ? 'Sign Up' : 'Login'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignup && type === 'user' && (
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          {type === 'admin' ? (
            <>
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  required
                  autoComplete="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {isSignup && (
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {isSignup && (
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          {type === 'admin' && isSignup && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
              <p className="font-medium">⚠️ Admin Account Creation</p>
              <p className="text-xs mt-1">Only existing admins can create new admin accounts. Please login first.</p>
            </div>
          )}

          <Button type="submit" className="w-full">
            {isSignup ? 'Sign Up' : 'Login'}
          </Button>

          {type === 'user' && (
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="w-full text-sm text-primary hover:underline"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
