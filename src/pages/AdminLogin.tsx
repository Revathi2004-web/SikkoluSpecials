import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, Shield } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';

export function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: {
          action: 'login',
          username: formData.username,
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

      // Store admin session
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      toast({ title: '✓ Admin login successful!' });
      setTimeout(() => navigate('/admin'), 1000);

    } catch (err: any) {
      console.error('Admin login error:', err);
      toast({ title: err.message || 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-fit mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-600 p-4 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
          <p className="text-center text-sm text-muted-foreground">Sikkolu Specials Dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input 
                placeholder="Admin username"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password"
                placeholder="Admin password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
              <Lock className="w-4 h-4 mr-2" />
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
