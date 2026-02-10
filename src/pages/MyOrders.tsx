import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, X, Eye } from 'lucide-react';
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
  payment_receipt_url?: string;
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
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await supabase.functions.invoke('send-sms', {
          body: {
            phone: '9876543210', // Admin phone from settings
            message: `Order #${orderId.slice(0, 8)} has been cancelled by customer ${customer.name}`,
            type: 'cancellation'
          }
        });
      }

      fetchOrders(customer.phone);
    } catch (err: any) {
      console.error('Cancel error:', err);
      toast({ title: 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header with Maroon Theme */}
      <div className="bg-gradient-to-r from-[#800000] to-[#600000] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white hover:bg-[#D4AF37] hover:text-[#800000] mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-[#D4AF37] p-3 rounded-xl">
              <Package className="w-8 h-8 text-[#800000]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-sm text-slate-200">Track your purchases</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#800000] mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-4 border-[#D4AF37]">
            <CardContent className="text-center py-16">
              <Package className="w-20 h-20 mx-auto mb-4 text-[#D4AF37]" />
              <p className="text-2xl font-bold text-[#800000] mb-2">No orders yet</p>
              <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
              <Button 
                onClick={() => navigate('/')} 
                className="bg-[#800000] hover:bg-[#600000] text-white"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-2 border-[#D4AF37] hover:shadow-2xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-slate-200 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                      {order.payment_status === 'verified' && (
                        <div className="mt-2 text-xs text-[#D4AF37] font-semibold">✓ Payment Verified</div>
                      )}
                      {order.payment_status === 'pending' && (
                        <div className="mt-2 text-xs text-yellow-300 font-semibold">⏳ Payment Pending</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="font-bold text-[#800000] mb-3 text-lg">Order Items:</h4>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center mb-2 p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-800">{item.name} <span className="text-slate-500">x {item.quantity}</span></span>
                          <span className="font-bold text-[#800000]">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center bg-gradient-to-r from-[#800000] to-[#600000] text-white p-4 rounded-lg">
                      <span className="font-bold text-xl">Total Amount:</span>
                      <span className="font-bold text-2xl text-[#D4AF37]">₹{order.total_price}</span>
                    </div>
                    {order.payment_receipt_url && (
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm font-semibold text-blue-800 mb-2">📎 Payment Receipt:</p>
                        <a 
                          href={order.payment_receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Receipt
                        </a>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm font-semibold text-green-800 mb-1">📦 Tracking Number:</p>
                        <p className="text-lg font-mono font-bold text-green-700">{order.tracking_number}</p>
                      </div>
                    )}
                    {order.status === 'pending' && (
                      <div className="pt-4 flex justify-end">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="w-5 h-5 mr-2" /> Cancel Order
                        </Button>
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
