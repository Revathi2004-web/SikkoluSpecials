// components/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { notifications } from '@/lib/notifications';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, 
  Plus, Save, Trash2, Eye, EyeOff, CheckCircle, XCircle, Receipt 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ upi_id: '', bank_details: '' });

  // 1. LIVE SYNC: Customer order ivvagane ventane sound/alert ravalante:
  useEffect(() => {
    fetchInitialData();
    const subscription = supabase
      .channel('live_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          notifications.playSound();
          toast({ title: "New Order Received! 🛒", description: "Check orders tab." });
        }
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchInitialData = async () => {
    const { data: ord } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: prod } = await supabase.from('products').select('*');
    const { data: sett } = await supabase.from('site_settings').select('*').single();
    setOrders(ord || []);
    setProducts(prod || []);
    if (sett) setPaymentSettings(sett.payment_data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const updateOrderField = async (orderId: string, updates: any) => {
    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (!error) {
      toast({ title: "Order Updated!", description: "Changes saved successfully." });
      fetchOrders();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // 2. INSTANT PAYMENT UPDATE: Ikkada update chesthe customer checkout page lo maripothundi
  const updatePaymentMethods = async () => {
    const { error } = await supabase
      .from('site_settings')
      .update({ payment_data: paymentSettings })
      .eq('id', 'master_config');
    
    if (!error) toast({ title: "Payment Methods Updated Live!" });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-slate-900 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold mb-8">Store Manager Pro</h1>
        <button onClick={() => setActiveTab('orders')} className={`w-full flex p-3 rounded ${activeTab === 'orders' ? 'bg-blue-600' : ''}`}><ShoppingCart className="mr-2"/> Orders</button>
        <button onClick={() => setActiveTab('products')} className={`w-full flex p-3 rounded ${activeTab === 'products' ? 'bg-blue-600' : ''}`}><Package className="mr-2"/> Products</button>
        <button onClick={() => setActiveTab('settings')} className={`w-full flex p-3 rounded ${activeTab === 'settings' ? 'bg-blue-600' : ''}`}><Settings className="mr-2"/> Settings & UPI</button>
      </nav>

      <main className="flex-1 p-8">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Live Orders</h2>
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm text-gray-500">#{order.id.slice(0,8)}</p>
                  <p className="font-bold text-lg">₹{order.total_amount}</p>
                  <p className="text-sm text-blue-600">{order.customer_name}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <Input 
                    placeholder="Tracking ID (BlueDart)" 
                    className="w-48"
                    defaultValue={order.tracking_id}
                    onBlur={(e) => updateOrderField(order.id, { tracking_id: e.target.value })}
                  />
                  <select 
                    className="border p-2 rounded"
                    value={order.status}
                    onChange={(e) => updateOrderField(order.id, { status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline" size="icon" title="View Receipt"><Receipt className="w-4 h-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-xl font-bold mb-6">Payment & Admin Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your UPI ID (For Customer Payments)</label>
                <Input 
                  value={paymentSettings.upi_id} 
                  onChange={e => setPaymentSettings({...paymentSettings, upi_id: e.target.value})}
                  placeholder="name@okaxis"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bank Details (Optional)</label>
                <textarea 
                  className="w-full border rounded-md p-2 h-24 text-sm"
                  value={paymentSettings.bank_details}
                  onChange={e => setPaymentSettings({...paymentSettings, bank_details: e.target.value})}
                  placeholder="Bank: HDFC, Acc: 123..."
                />
              </div>
              <Button onClick={updatePaymentMethods} className="w-full bg-green-600 hover:bg-green-700">
                <Save className="mr-2 w-4 h-4"/> Update Live Store
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
