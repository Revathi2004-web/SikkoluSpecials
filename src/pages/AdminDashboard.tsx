import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Plus, Trash2, Edit, Bell, Save, Eye, EyeOff, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { notifications } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { Product, Order } from '@/types';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [orders, setOrders] = useState<Order[]>(storage.getOrders());
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // FEATURE: LIVE MONITORING
  useEffect(() => {
    const checkOrders = () => {
      const currentOrders = storage.getOrders();
      const newOnes = notifications.getNewOrdersCount(currentOrders);
      
      if (newOnes > 0 && newOnes !== newOrdersCount) {
        setNewOrdersCount(newOnes);
        notifications.playSound(); 
        notifications.showNotification('New Order Received! 🛒', `You have ${newOnes} new orders.`);
      }
      setOrders(currentOrders);
    };

    const timer = setInterval(checkOrders, 3000); // 3 seconds ki okasari check chesthundhi
    return () => clearInterval(timer);
  }, [newOrdersCount]);

  // FEATURE: INSTANT SYNC (Visibility Toggle)
  const toggleVisibility = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    storage.updateProduct(id, { status: newStatus as any });
    setProducts(storage.getProducts()); 
    toast({ title: `Product status: ${newStatus.toUpperCase()}` });
  };

  // FEATURE: ORDER TRACKING UPDATE
  const updateOrder = (orderId: string, status: string, tracking: string) => {
    storage.updateOrder(orderId, { status: status as any, trackingNumber: tracking });
    setOrders(storage.getOrders());
    toast({ title: "Order & Tracking Updated!" });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold">Admin Control Panel</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-md transition ${activeTab === 'products' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
          >
            Products
          </button>
          <button 
            onClick={() => {
              setActiveTab('orders');
              setNewOrdersCount(0);
              notifications.updateLastOrderCheck();
            }}
            className={`px-6 py-2 rounded-md transition relative ${activeTab === 'orders' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
          >
            Orders History
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {newOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative h-40">
                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                <button 
                  onClick={() => toggleVisibility(p.id, p.status)}
                  className={`absolute top-2 right-2 p-2 rounded-full shadow-lg ${p.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                >
                  {p.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-primary font-bold text-xl">₹{p.price}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" size="sm"><Edit size={14} className="mr-2"/> Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => { storage.deleteProduct(p.id); setProducts(storage.getProducts()); }}><Trash2 size={14}/></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? <p className="text-center py-20 text-gray-400">No orders found.</p> : 
            orders.map(order => (
              <div key={order.id} className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono text-gray-400">ORDER #{order.id}</span>
                    <h4 className="font-bold text-lg">₹{order.totalAmount}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Change Status</Label>
                    <select 
                      className="w-full border rounded-lg p-2 bg-gray-50"
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, e.target.value, order.trackingNumber || '')}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tracking ID (BlueDart/Delhivery)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ex: 123456789" 
                        defaultValue={order.trackingNumber}
                        onBlur={(e) => updateOrder(order.id, order.status, e.target.value)}
                      />
                      <Button size="icon"><Save size={16}/></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
