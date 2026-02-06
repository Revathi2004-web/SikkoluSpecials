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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-fit mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Join Sikkolu Specials</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Full Name*</Label>
              <Input 
                placeholder="Your name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Phone Number*</Label>
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
              <Label>Email (Optional)</Label>
              <Input 
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Password*</Label>
              <Input 
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label>Confirm Password*</Label>
              <Input 
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-primary font-semibold hover:underline"
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
