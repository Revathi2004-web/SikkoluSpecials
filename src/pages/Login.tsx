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
    
    if (formData.phone.length !== 10) {
      toast({ title: 'Please enter a valid 10-digit phone number', variant: 'destructive' });
      return;
    }

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

      // Store customer session
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
    <div className="min-h-screen bg-gradient-to-br from-[#800000] to-[#400000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-4 border-[#D4AF37]">
        <CardHeader className="bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-t-lg">
          <Button variant="ghost" onClick={() => navigate('/')} className="w-fit mb-2 text-white hover:bg-[#D4AF37] hover:text-[#800000]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <CardTitle className="text-3xl text-center font-bold">Customer Login</CardTitle>
          <p className="text-center text-sm text-[#D4AF37]">Welcome Back!</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-[#800000] font-semibold">Phone Number*</Label>
              <Input 
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                maxLength={10}
                required
                autoComplete="tel"
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <div>
              <Label className="text-[#800000] font-semibold">Password*</Label>
              <Input 
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                autoComplete="current-password"
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#800000] hover:bg-[#600000] text-white h-12 text-lg font-bold" 
              disabled={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-[#800000] font-bold hover:text-[#D4AF37] hover:underline"
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
