import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, Trash2, Eye, EyeOff, ShoppingCart, Package, Settings, X, Users, Phone, Receipt, TrendingUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { Product, Order, Admin, Contact, PaymentMethod } from '@/types';
import { ImageUpload } from '@/components/features/ImageUpload';
import { ContactNumbers } from '@/components/features/ContactNumbers';
import { notifications } from '@/lib/notifications';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const lastCheckRef = useRef<Date>(new Date());

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    mrp: 0,
    category: 'traditional',
    image: '',
    description: '',
    status: 'published'
  });

  useEffect(() => {
    loadData();
    notifications.requestPermission();
    
    // Orders ki polling setup
    const interval = setInterval(() => {
      const latestOrders = storage.getOrders();
      const newCount = latestOrders.filter(
        order => new Date(order.orderDate) > lastCheckRef.current
      ).length;
      
      if (newCount > 0) {
        setNewOrdersCount(newCount);
        notifications.playSound();
        notifications.showNotification(
          'New Order Received!',
          `You have ${newCount} new order(s)`
        );
      }
      setOrders(latestOrders);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setProducts(storage.getProducts());
    setOrders(storage.getOrders());
    setAdmins(storage.getAdmins());
    setContacts(storage.getContacts());
    setPaymentMethods(storage.getPaymentMethods());
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      price: newProduct.price!,
      mrp: newProduct.mrp || newProduct.price!,
      category: newProduct.category || 'traditional',
      image: newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      description: newProduct.description || '',
      status: newProduct.status || 'published',
      rating: 0,
      reviews: []
    };

    storage.addProduct(product);
    window.dispatchEvent(new Event('storage'));
    setProducts(storage.getProducts());
    setIsAddModalOpen(false);
    setNewProduct({ name: '', price: 0, mrp: 0, category: 'traditional', image: '', description: '', status: 'published' });
    toast({ title: "Product Added Successfully!" });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    storage.updateProduct(editingProduct.id, editingProduct);
    window.dispatchEvent(new Event('storage'));
    setProducts(storage.getProducts());
    setEditingProduct(null);
    toast({ title: "Product Updated Successfully!" });
  };

  const deleteProduct = (id: string) => {
    storage.deleteProduct(id);
    window.dispatchEvent(new Event('storage'));
    setProducts(storage.getProducts());
    toast({ title: "Product Deleted" });
  };

  const toggleProductStatus = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    storage.updateProduct(id, { status: newStatus });
    window.dispatchEvent(new Event('storage'));
    setProducts(storage.getProducts());
    toast({ 
      title: newStatus === 'published' ? "Product Published" : "Product Unpublished"
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    storage.updateOrder(orderId, { status });
    setOrders(storage.getOrders());
    toast({ title: `Order status updated to ${status}` });
  };

  const updateOrderPayment = (orderId: string, paymentStatus: Order['paymentStatus']) => {
    const updates: Partial<Order> = { paymentStatus };
    if (paymentStatus === 'completed') {
      updates.paymentDate = new Date().toISOString();
    }
    storage.updateOrder(orderId, updates);
    setOrders(storage.getOrders());
    toast({ title: `Payment status updated to ${paymentStatus}` });
  };

  const updateOrderTracking = (orderId: string, trackingNumber: string) => {
    storage.updateOrder(orderId, { trackingNumber });
    setOrders(storage.getOrders());
    setEditingOrder(null);
    toast({ title: "Tracking number updated" });
  };

  const clearNewOrdersBadge = () => {
    lastCheckRef.current = new Date();
    setNewOrdersCount(0);
    notifications.updateLastOrderCheck();
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    publishedProducts: products.filter(p => p.status === 'published').length
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 shadow-2xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sikkolu Admin
          </h2>
          <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => { setActiveTab('orders'); clearNewOrdersBadge(); }} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'hover:bg-slate-700'
            }`}
          >
            <ShoppingCart size={20}/>
            <span className="flex-1 text-left">Orders</span>
            {newOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'products' ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'hover:bg-slate-700'
            }`}
          >
            <Package size={20}/>
            <span>Products</span>
          </button>

          <button 
            onClick={() => setActiveTab('payments')} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'payments' ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'hover:bg-slate-700'
            }`}
          >
            <Receipt size={20}/>
            <span>Payments</span>
          </button>

          <button 
            onClick={() => setActiveTab('contacts')} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'contacts' ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'hover:bg-slate-700'
            }`}
          >
            <Phone size={20}/>
            <span>Contacts</span>
          </button>

          <button 
            onClick={() => setActiveTab('admins')} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'admins' ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'hover:bg-slate-700'
            }`}
          >
            <Users size={20}/>
            <span>Admins</span>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="mt-10 pt-6 border-t border-slate-700 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Orders</span>
            <span className="font-bold">{stats.totalOrders}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Products</span>
            <span className="font-bold">{stats.publishedProducts}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Revenue</span>
            <span className="font-bold text-green-400">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                <p className="text-gray-500 mt-1">Track and manage customer orders</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-6 py-3 rounded-xl shadow border">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-xl shadow border">
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Payment</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{order.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                      </td>
                      <td className="p-4 font-bold text-green-600">₹{order.totalAmount}</td>
                      <td className="p-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderPayment(order.id, e.target.value as Order['paymentStatus'])}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                            'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingOrder(order)}
                        >
                          Add Tracking
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
                <p className="text-gray-500 mt-1">Manage your inventory</p>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="mr-2 h-5 w-5"/> Add New Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition group">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`p-2 rounded-full backdrop-blur-sm ${
                          product.status === 'published' 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-gray-500/90 text-white'
                        }`}
                      >
                        {product.status === 'published' ? <Eye size={16}/> : <EyeOff size={16}/>}
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === 'published' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {product.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <>
                          <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingProduct(product)}
                      >
                        <Edit size={14} className="mr-1"/> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 size={14}/>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Methods</h1>
            <ContactNumbers 
              contacts={paymentMethods}
              onUpdate={(updated) => {
                storage.setPaymentMethods(updated);
                setPaymentMethods(updated);
                toast({ title: "Payment methods updated" });
              }}
              title="Payment Options"
              description="Manage UPI IDs and bank account details"
              placeholderLabel="UPI ID / Account Number"
              placeholderValue="example@upi or 1234567890"
            />
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Numbers</h1>
            <ContactNumbers 
              contacts={contacts}
              onUpdate={(updated) => {
                storage.setContacts(updated);
                setContacts(updated);
                toast({ title: "Contact numbers updated" });
              }}
            />
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Accounts</h1>
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              {admins.map(admin => (
                <div key={admin.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                  <div>
                    <p className="font-bold text-gray-800">{admin.username}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                    Admin
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <Label>Product Name *</Label>
                <Input 
                  placeholder="e.g., Traditional Srikakulam Mango Pickle"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Selling Price (₹) *</Label>
                  <Input 
                    type="number"
                    placeholder="499"
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>MRP (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="699"
                    value={newProduct.mrp || ''}
                    onChange={e => setNewProduct({...newProduct, mrp: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                  className="w-full mt-1 border rounded-lg p-2"
                >
                  <option value="traditional">Traditional</option>
                  <option value="handicrafts">Handicrafts</option>
                  <option value="textiles">Textiles</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div>
                <Label>Product Image</Label>
                <ImageUpload
                  currentImage={newProduct.image}
                  onImageChange={(image) => setNewProduct({...newProduct, image})}
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  placeholder="Describe the product features, benefits, and authenticity..."
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3 h-24 resize-none"
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={newProduct.status}
                  onChange={e => setNewProduct({...newProduct, status: e.target.value as 'draft' | 'published'})}
                  className="w-full mt-1 border rounded-lg p-2"
                >
                  <option value="published">Published (Visible to customers)</option>
                  <option value="draft">Draft (Hidden from customers)</option>
                </select>
              </div>

              <Button onClick={handleAddProduct} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg">
                <Save className="mr-2"/> Save Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24}/>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <Label>Product Name</Label>
                <Input 
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Selling Price (₹)</Label>
                  <Input 
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>MRP (₹)</Label>
                  <Input 
                    type="number"
                    value={editingProduct.mrp}
                    onChange={e => setEditingProduct({...editingProduct, mrp: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                  className="w-full mt-1 border rounded-lg p-2"
                >
                  <option value="traditional">Traditional</option>
                  <option value="handicrafts">Handicrafts</option>
                  <option value="textiles">Textiles</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div>
                <Label>Product Image</Label>
                <ImageUpload
                  currentImage={editingProduct.image}
                  onImageChange={(image) => setEditingProduct({...editingProduct, image})}
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full mt-1 border rounded-lg p-3 h-24 resize-none"
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={editingProduct.status}
                  onChange={e => setEditingProduct({...editingProduct, status: e.target.value as 'draft' | 'published'})}
                  className="w-full mt-1 border rounded-lg p-2"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <Button onClick={handleUpdateProduct} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 text-lg">
                <Save className="mr-2"/> Update Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Tracking Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Tracking Number</h2>
              <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Order ID</Label>
                <p className="text-sm text-gray-600 font-mono">#{editingOrder.id.slice(0, 8)}</p>
              </div>
              
              <div>
                <Label>Tracking Number</Label>
                <Input 
                  placeholder="e.g., TRACK123456789"
                  defaultValue={editingOrder.trackingNumber || ''}
                  onChange={e => setEditingOrder({...editingOrder, trackingNumber: e.target.value})}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={() => updateOrderTracking(editingOrder.id, editingOrder.trackingNumber || '')}
                className="w-full"
              >
                <Save className="mr-2"/> Save Tracking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
