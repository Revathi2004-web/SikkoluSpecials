import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, Plus, Trash2, Phone, Edit, Bell, CreditCard, Save, Eye, EyeOff, CheckCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/features/ImageUpload';
import { storage } from '@/lib/storage';
import { notifications } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { Product, Order, Admin, ContactNumber, PaymentInfo } from '@/types';
import { CATEGORIES } from '@/constants/categories';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'admins' | 'contacts' | 'payments'>('products');
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [orders, setOrders] = useState<Order[]>(storage.getOrders());
  const [admins, setAdmins] = useState<Admin[]>(storage.getAdmins());
  const [contacts, setContacts] = useState<ContactNumber[]>(storage.getContactNumbers());
  const [payments, setPayments] = useState<PaymentInfo[]>(storage.getPaymentInfo());
  
  // Feature: New Order Notifications
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // --- FEATURE: LIVE ORDER MONITORING & NOTIFICATIONS ---
  useEffect(() => {
    const checkNewOrders = () => {
      const currentOrders = storage.getOrders();
      const newCount = notifications.getNewOrdersCount(currentOrders);
      
      if (newCount > 0 && newCount !== newOrdersCount) {
        setNewOrdersCount(newCount);
        notifications.playSound(); // Play alert sound
        
        notifications.requestPermission().then(granted => {
          if (granted) {
            notifications.showNotification(
              'New Order Received! 🛒',
              `You have ${newCount} new order(s) waiting for review.`
            );
          }
        });
      }
      setOrders(currentOrders);
    };

    const interval = setInterval(checkNewOrders, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [newOrdersCount]);

  // --- FEATURE: INSTANT PRODUCT SYNC ---
  const handleToggleProductStatus = (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    storage.updateProduct(product.id, { status: newStatus });
    setProducts(storage.getProducts()); // Instant UI Update
    
    toast({ 
      title: newStatus === 'published' ? '✅ Product Live' : '📦 Product Hidden',
      description: `Instant sync complete. Users ${newStatus === 'published' ? 'can now' : 'can no longer'} see this.`
    });
  };

  // --- FEATURE: ORDER TRANSACTION & TRACKING ---
  const handleUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    storage.updateOrder(orderId, updates);
    setOrders(storage.getOrders());
    setEditingOrder(null);
    toast({ title: 'Order Updated', description: 'Transaction history and status updated.' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {/* Notification Bell */}
        <div className="relative">
          <Bell className={`w-6 h-6 ${newOrdersCount > 0 ? 'text-red-500 animate-bounce' : 'text-gray-400'}`} />
          {newOrdersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              {newOrdersCount}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards... (Keep your existing grid here) */}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b flex overflow-x-auto">
           {/* Tab buttons... ensure 'orders' button calls notifications.updateLastOrderCheck() */}
           <button 
            onClick={() => { setActiveTab('orders'); setNewOrdersCount(0); notifications.updateLastOrderCheck(); }}
            className={`px-6 py-3 ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : ''}`}
           >
            Orders History
           </button>
           <button onClick={() => setActiveTab('products')} className={`px-6 py-3 ${activeTab === 'products' ? 'border-b-2 border-primary' : ''}`}>
             Products
           </button>
        </div>

        <div className="p-6">
          {/* ORDERS TAB: Transaction History & Status */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border p-4 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {order.status.toUpperCase()}
                       </span>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="text-sm mb-4 border-y py-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Status & Tracking Controls */}
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <Label>Update Status & Tracking</Label>
                      <div className="flex gap-2 mt-1">
                        <select 
                          className="border rounded px-2 py-1 text-sm bg-white"
                          value={order.status}
                          onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value as any })}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <Input 
                          placeholder="Tracking ID" 
                          className="h-8 text-xs"
                          defaultValue={order.trackingNumber}
                          onBlur={(e) => handleUpdateOrder(order.id, { trackingNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-200" onClick={() => handleDeleteOrder(order.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS TAB: Logic for Instant Sync Toggling */}
          {activeTab === 'products' && (
            <div className="grid md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg relative">
                  <img src={product.image} className="w-full h-32 object-cover rounded-t-lg" />
                  
                  {/* Floating Toggle Button for Visibility */}
                  <button 
                    onClick={() => handleToggleProductStatus(product)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-colors ${
                      product.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                    }`}
                    title={product.status === 'published' ? "Click to Hide from Users" : "Click to Make Live"}
                  >
                    {product.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div className="p-3">
                    <h3 className="font-bold truncate">{product.name}</h3>
                    <p className="text-primary font-bold">₹{product.price}</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditProduct(product)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
