import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (formData.phone.length !== 10) {
      toast({ title: 'Please enter a valid 10-digit phone number', variant: 'destructive' });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('auth-customer', {
        body: {
          action: 'register',
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          email: formData.email
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

      toast({ title: '✓ Registration successful! Please login.' });
      setTimeout(() => navigate('/login'), 1500);

    } catch (err: any) {
      console.error('Registration error:', err);
      toast({ title: err.message || 'Registration failed', variant: 'destructive' });
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
          <CardTitle className="text-3xl text-center font-bold">Create Account</CardTitle>
          <p className="text-center text-sm text-[#D4AF37]">Join Sikkolu Specials</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-[#800000] font-semibold">Full Name*</Label>
              <Input 
                placeholder="Your name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <div>
              <Label className="text-[#800000] font-semibold">Phone Number*</Label>
              <Input 
                type="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                maxLength={10}
                required
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <div>
              <Label className="text-[#800000] font-semibold">Email (Optional)</Label>
              <Input 
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <div>
              <Label className="text-[#800000] font-semibold">Password*</Label>
              <Input 
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <div>
              <Label className="text-[#800000] font-semibold">Confirm Password*</Label>
              <Input 
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
                className="border-[#D4AF37] focus:border-[#800000]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#800000] hover:bg-[#600000] text-white h-12 text-lg font-bold" 
              disabled={loading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Creating Account...' : 'Register Now'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-[#800000] font-bold hover:text-[#D4AF37] hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
