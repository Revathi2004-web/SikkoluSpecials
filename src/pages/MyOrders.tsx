import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: string;
  payment_status: string;
  items: any[];
  created_at: string;
  tracking_number?: string;
}

export function MyOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (!customerData) {
      toast({ title: 'Please login to view orders', variant: 'destructive' });
      navigate('/login');
      return;
    }
    
    const parsedCustomer = JSON.parse(customerData);
    setCustomer(parsedCustomer);
    fetchOrders(parsedCustomer.phone);
  }, []);

  const fetchOrders = async (phone: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast({ title: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({ title: '✓ Order cancelled successfully' });
      
      // Send SMS notification to admin about cancellation
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: '9876543210', // Admin phone from settings
          message: `Order #${orderId.slice(0, 8)} has been cancelled by customer ${customer.name}`,
          type: 'cancellation'
        }
      });

      fetchOrders(customer.phone);
    } catch (err: any) {
      console.error('Cancel error:', err);
      toast({ title: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Button onClick={() => navigate('/')}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                      {order.payment_status === 'verified' && (
                        <div className="mt-2 text-xs text-green-600 font-semibold">✓ Payment Verified</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Items:</h4>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm mb-1">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center">
                      <span className="font-bold text-lg">Total: ₹{order.total_price}</span>
                      {order.status === 'pending' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <X className="w-4 h-4 mr-2" /> Cancel Order
                        </Button>
                      )}
                    </div>
                    {order.tracking_number && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold">Tracking Number:</p>
                        <p className="text-lg font-mono">{order.tracking_number}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
