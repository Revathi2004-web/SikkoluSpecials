import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, LogIn } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('auth-customer', {
        body: {
          action: 'login',
          phone: formData.phone,
          password: formData.password
        }
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const textContent = await error.context?.text();
            const parsedError = JSON.parse(textContent || '{}');
            errorMessage = parsedError.error || error.message;
          } catch {
            errorMessage = error.message;
          }
        }
        throw new Error(errorMessage);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Store customer data in localStorage
      localStorage.setItem('customer', JSON.stringify(data.customer));
      
      toast({ title: '✓ Login successful!' });
      setTimeout(() => navigate('/'), 1000);

    } catch (err: any) {
      console.error('Login error:', err);
      toast({ title: err.message || 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-fit mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <CardTitle className="text-2xl text-center">Customer Login</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Welcome back to Sikkolu Specials</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input 
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                maxLength={10}
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password"
                placeholder="Your password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-primary font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
