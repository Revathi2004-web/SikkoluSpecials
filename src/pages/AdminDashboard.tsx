import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, 
  Plus, Save, Trash2, Eye, EyeOff, LogOut, Phone,
  UserPlus, CheckCircle, XCircle, Truck, CreditCard, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { Product, Order, Admin, Contact } from '@/types';
import { ImageUpload } from '@/components/features/ImageUpload';
import { notifications } from '@/lib/notifications';

export function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    category: 'handicrafts',
    image: '',
    status: 'published' as 'draft' | 'published'
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    upiId: '',
    qrCodeImage: '',
    bankAccountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });

  // Admin form
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });

  // Contact form
  const [contactForm, setContactForm] = useState({
    phoneNumber: '',
    label: ''
  });

  // Load data
  useEffect(() => {
    loadAllData();
    
    // Request notification permission
    notifications.requestPermission();

    // Listen for storage events (real-time sync)
    const handleStorageChange = () => {
      loadAllData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for new orders every 2 seconds
    const interval = setInterval(() => {
      const currentOrders = storage.getOrders();
      setOrders(currentOrders);
      const count = notifications.getNewOrdersCount(currentOrders);
      if (count > 0) {
        setNewOrderCount(count);
        notifications.playSound();
        notifications.showNotification(
          'New Orders!',
          `You have ${count} new order(s)`
        );
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadAllData = () => {
    setProducts(storage.getProducts());
    setOrders(storage.getOrders());
    setAdmins(storage.getAdmins());
    setContacts(storage.getContacts());
    setPaymentSettings(storage.getPaymentSettings());
  };

  // Mark orders as viewed
  const markOrdersAsViewed = () => {
    if (newOrderCount > 0) {
      notifications.updateLastOrderCheck();
      setNewOrderCount(0);
    }
  };

  // Product actions
  const saveProduct = () => {
    if (!productForm.name || !productForm.price) {
      toast({
        title: 'Missing fields',
        description: 'Please fill name and price',
        variant: 'destructive'
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      mrp: productForm.mrp ? parseFloat(productForm.mrp) : undefined,
      category: productForm.category,
      image: productForm.image,
      rating: 0,
      reviews: [],
      status: productForm.status
    };

    storage.addProduct(product);
    setProducts(storage.getProducts());
    
    // Trigger storage event for real-time sync
    window.dispatchEvent(new Event('storage'));
    
    toast({ title: 'Product added successfully!' });
    setProductForm({
      name: '',
      description: '',
      price: '',
      mrp: '',
      category: 'handicrafts',
      image: '',
      status: 'published'
    });
  };

  const toggleProductStatus = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const updated = {
        ...product,
        status: product.status === 'published' ? 'draft' as const : 'published' as const
      };
      storage.updateProduct(id, updated);
      setProducts(storage.getProducts());
      window.dispatchEvent(new Event('storage'));
      toast({
        title: updated.status === 'published' ? 'Product published' : 'Product unpublished'
      });
    }
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      storage.deleteProduct(id);
      setProducts(storage.getProducts());
      window.dispatchEvent(new Event('storage'));
      toast({ title: 'Product deleted' });
    }
  };

  // Order actions
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      storage.updateOrder(orderId, { ...order, status });
      setOrders(storage.getOrders());
      toast({ title: `Order ${status}` });
    }
  };

  const updateOrderTracking = (orderId: string, trackingNumber: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      storage.updateOrder(orderId, { ...order, trackingNumber });
      setOrders(storage.getOrders());
      toast({ title: 'Tracking number updated' });
    }
  };

  const updateOrderPayment = (orderId: string, paymentStatus: 'pending' | 'completed') => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updates: Partial<Order> = { paymentStatus };
      if (paymentStatus === 'completed' && !order.paymentDate) {
        updates.paymentDate = new Date().toISOString();
      }
      storage.updateOrder(orderId, { ...order, ...updates });
      setOrders(storage.getOrders());
      toast({ title: `Payment marked as ${paymentStatus}` });
    }
  };

  // Payment settings
  const savePaymentSettings = () => {
    storage.updatePaymentSettings(paymentSettings);
    toast({ title: 'Payment settings saved' });
  };

  // Admin actions
  const addAdmin = () => {
    if (!adminForm.username || !adminForm.password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill username and password',
        variant: 'destructive'
      });
      return;
    }

    const admin: Admin = {
      id: Date.now().toString(),
      username: adminForm.username,
      password: adminForm.password
    };

    storage.addAdmin(admin);
    setAdmins(storage.getAdmins());
    toast({ title: 'Admin added successfully!' });
    setAdminForm({ username: '', password: '' });
  };

  const deleteAdmin = (id: string) => {
    if (admins.length <= 1) {
      toast({
        title: 'Cannot delete',
        description: 'At least one admin must exist',
        variant: 'destructive'
      });
      return;
    }
    
    if (confirm('Are you sure you want to delete this admin?')) {
      storage.deleteAdmin(id);
      setAdmins(storage.getAdmins());
      toast({ title: 'Admin deleted' });
    }
  };

  // Contact actions
  const addContact = () => {
    if (!contactForm.phoneNumber) {
      toast({
        title: 'Missing phone number',
        variant: 'destructive'
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      phoneNumber: contactForm.phoneNumber,
      label: contactForm.label
    };

    storage.addContact(contact);
    setContacts(storage.getContacts());
    toast({ title: 'Contact added successfully!' });
    setContactForm({ phoneNumber: '', label: '' });
  };

  const deleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      storage.deleteContact(id);
      setContacts(storage.getContacts());
      toast({ title: 'Contact deleted' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10">
          <LayoutDashboard size={28} />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <Package size={20} />
            <span>Products</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              markOrdersAsViewed();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition relative ${
              activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <ShoppingCart size={20} />
            <span>Orders</span>
            {newOrderCount > 0 && (
              <span className="absolute right-3 top-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {newOrderCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'payments' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <CreditCard size={20} />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'admins' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <UserPlus size={20} />
            <span>Admins</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'contacts' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <Phone size={20} />
            <span>Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-10 hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Manage Products</h1>

            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="handicrafts">Handicrafts</option>
                    <option value="textiles">Textiles</option>
                    <option value="food">Food Products</option>
                    <option value="art">Art & Decor</option>
                  </select>
                </div>

                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <Label>MRP (₹) - Optional</Label>
                  <Input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="Enter MRP"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Product Image</Label>
                  <ImageUpload
                    onImageSelect={(base64) => setProductForm({ ...productForm, image: base64 })}
                  />
                  {productForm.image && (
                    <img src={productForm.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Status</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={productForm.status === 'published'}
                        onChange={() => setProductForm({ ...productForm, status: 'published' })}
                      />
                      <span>Published</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={productForm.status === 'draft'}
                        onChange={() => setProductForm({ ...productForm, status: 'draft' })}
                      />
                      <span>Draft</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button onClick={saveProduct} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">₹{product.price}</div>
                        {product.mrp && <div className="text-sm text-gray-500 line-through">₹{product.mrp}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleProductStatus(product.id)}
                            title={product.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {product.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm font-mono">{order.id.substring(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.productName}</div>
                        <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">₹{order.totalPrice}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                            order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateOrderPayment(order.id, 'completed')}
                              title="Mark as paid"
                              className="text-green-600"
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateOrderPayment(order.id, 'pending')}
                              title="Mark as pending"
                              className="text-yellow-600"
                            >
                              <XCircle size={14} />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-2 py-1 text-sm border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Input
                            placeholder="Tracking #"
                            value={order.trackingNumber || ''}
                            onChange={(e) => updateOrderTracking(order.id, e.target.value)}
                            className="text-sm"
                          />
                          <div className="text-xs text-gray-500">
                            {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">UPI Settings</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <Label>UPI ID</Label>
                  <Input
                    value={paymentSettings.upiId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                    placeholder="yourname@upi"
                  />
                </div>

                <div>
                  <Label>UPI QR Code</Label>
                  <ImageUpload
                    onImageSelect={(base64) => setPaymentSettings({ ...paymentSettings, qrCodeImage: base64 })}
                  />
                  {paymentSettings.qrCodeImage && (
                    <img src={paymentSettings.qrCodeImage} alt="QR Code" className="mt-2 w-48 h-48 object-contain border rounded" />
                  )}
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 mt-8">Bank Transfer Settings</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={paymentSettings.bankAccountNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <Label>IFSC Code</Label>
                  <Input
                    value={paymentSettings.ifscCode}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, ifscCode: e.target.value })}
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div>
                  <Label>Account Holder Name</Label>
                  <Input
                    value={paymentSettings.accountHolderName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, accountHolderName: e.target.value })}
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>

              <Button onClick={savePaymentSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Payment Settings
              </Button>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Manage Admins</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <Button onClick={addAdmin} className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" /> Add Admin
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 font-medium">{admin.username}</td>
                      <td className="px-6 py-4 font-mono text-sm">{admin.password}</td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Manage Contact Numbers</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Add Contact Number</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={contactForm.phoneNumber}
                    onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label>Label (Optional)</Label>
                  <Input
                    value={contactForm.label}
                    onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
                    placeholder="e.g., Primary, Sales, Support"
                  />
                </div>
              </div>

              <Button onClick={addContact} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 font-medium">{contact.phoneNumber}</td>
                      <td className="px-6 py-4">{contact.label || '-'}</td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-600">Additional settings will be added here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
