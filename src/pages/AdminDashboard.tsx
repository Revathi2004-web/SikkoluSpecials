import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, Plus, Trash2, Phone, Edit, Bell, CreditCard, Save } from 'lucide-react';
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
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
  const [newContact, setNewContact] = useState({ label: '', number: '', isPrimary: false });
  const [newPayment, setNewPayment] = useState({
    type: 'upi' as 'upi' | 'bank',
    upiId: '',
    qrCode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'snacks',
    price: '',
    image: '',
    description: '',
  });

  // Check for new orders and send notifications
  useEffect(() => {
    const checkNewOrders = () => {
      const currentOrders = storage.getOrders();
      const newCount = notifications.getNewOrdersCount(currentOrders);
      
      if (newCount > 0 && newCount !== newOrdersCount) {
        setNewOrdersCount(newCount);
        notifications.playSound();
        
        notifications.requestPermission().then(granted => {
          if (granted) {
            notifications.showNotification(
              'New Order Received! 🛒',
              `You have ${newCount} new order${newCount > 1 ? 's' : ''} waiting for review.`
            );
          }
        });
      }
      
      setOrders(currentOrders);
    };

    const interval = setInterval(checkNewOrders, 3000);
    checkNewOrders();

    return () => clearInterval(interval);
  }, [newOrdersCount]);

  const handleOrdersTabClick = () => {
    setActiveTab('orders');
    notifications.updateLastOrderCheck();
    setNewOrdersCount(0);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.image) {
      toast({ title: 'Please upload a product image', variant: 'destructive' });
      return;
    }
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      image: newProduct.image,
      description: newProduct.description,
      createdAt: new Date().toISOString(),
    };
    storage.addProduct(product);
    setProducts(storage.getProducts());
    setNewProduct({ name: '', category: 'snacks', price: '', image: '', description: '' });
    setShowAddProduct(false);
    toast({ title: 'Product added successfully! Users will see it immediately.' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    
    storage.updateProduct(editingProduct.id, {
      name: editingProduct.name,
      category: editingProduct.category,
      price: editingProduct.price,
      image: editingProduct.image,
      description: editingProduct.description,
    });
    setProducts(storage.getProducts());
    setEditingProduct(null);
    toast({ title: 'Product updated! Changes are live for all users.' });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      storage.deleteProduct(productId);
      setProducts(storage.getProducts());
      toast({ title: 'Product deleted. Changes synced to all users.' });
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      storage.deleteOrder(orderId);
      setOrders(storage.getOrders());
      toast({ title: 'Order deleted' });
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (admins.length === 1) {
      toast({ title: 'Cannot delete the last admin', variant: 'destructive' });
      return;
    }
    if (confirm('Are you sure you want to remove this admin?')) {
      storage.deleteAdmin(adminId);
      setAdmins(storage.getAdmins());
      toast({ title: 'Admin removed' });
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingAdmin = admins.find(a => a.username === newAdmin.username);
    if (existingAdmin) {
      toast({ title: 'Username already exists', variant: 'destructive' });
      return;
    }
    
    const admin: Admin = {
      id: Date.now().toString(),
      username: newAdmin.username,
      email: newAdmin.email,
      password: newAdmin.password,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    
    storage.addAdmin(admin);
    setAdmins(storage.getAdmins());
    setNewAdmin({ username: '', email: '', password: '' });
    setShowAddAdmin(false);
    toast({ title: 'New admin added successfully!' });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contact: ContactNumber = {
      id: Date.now().toString(),
      label: newContact.label,
      number: newContact.number,
      isPrimary: newContact.isPrimary,
    };
    
    storage.addContactNumber(contact);
    setContacts(storage.getContactNumbers());
    setNewContact({ label: '', number: '', isPrimary: false });
    setShowAddContact(false);
    toast({ title: 'Contact number added!' });
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact number?')) {
      storage.deleteContactNumber(contactId);
      setContacts(storage.getContactNumbers());
      toast({ title: 'Contact deleted' });
    }
  };

  const handleTogglePrimaryContact = (contactId: string) => {
    const updatedContacts = contacts.map(c => ({
      ...c,
      isPrimary: c.id === contactId ? !c.isPrimary : c.isPrimary,
    }));
    updatedContacts.forEach(c => storage.updateContactNumber(c.id, { isPrimary: c.isPrimary }));
    setContacts(storage.getContactNumbers());
    toast({ title: 'Contact updated' });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment: PaymentInfo = {
      id: Date.now().toString(),
      type: newPayment.type,
      ...(newPayment.type === 'upi' ? {
        upiId: newPayment.upiId,
        qrCode: newPayment.qrCode,
      } : {
        bankName: newPayment.bankName,
        accountNumber: newPayment.accountNumber,
        ifscCode: newPayment.ifscCode,
        accountHolder: newPayment.accountHolder,
      }),
      isActive: true,
    };
    
    storage.addPaymentInfo(payment);
    setPayments(storage.getPaymentInfo());
    setNewPayment({
      type: 'upi',
      upiId: '',
      qrCode: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolder: '',
    });
    setShowAddPayment(false);
    toast({ title: 'Payment method added!' });
  };

  const handleTogglePaymentActive = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      storage.updatePaymentInfo(paymentId, { isActive: !payment.isActive });
      setPayments(storage.getPaymentInfo());
      toast({ title: payment.isActive ? 'Payment method disabled' : 'Payment method enabled' });
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      storage.deletePaymentInfo(paymentId);
      setPayments(storage.getPaymentInfo());
      toast({ title: 'Payment method deleted' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <Package className="w-10 h-10 text-primary opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Admins</p>
              <p className="text-3xl font-bold">{admins.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contact Numbers</p>
              <p className="text-3xl font-bold">{contacts.length}</p>
            </div>
            <Phone className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payment Methods</p>
              <p className="text-3xl font-bold">{payments.filter(p => p.isActive).length}</p>
            </div>
            <CreditCard className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b overflow-x-auto">
          <div className="flex min-w-max">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'products'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Products
            </button>
            <button
              onClick={handleOrdersTabClick}
              className={`px-6 py-3 font-medium relative whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                Orders
                {newOrdersCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Bell className="w-4 h-4 animate-pulse" />
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {newOrdersCount}
                    </span>
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'admins'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Contacts
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Products</h2>
                <Button onClick={() => setShowAddProduct(!showAddProduct)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {showAddProduct && (
                <form onSubmit={handleAddProduct} className="bg-muted p-4 rounded-lg mb-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        required
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        required
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Product Image *</Label>
                    <ImageUpload
                      value={newProduct.image}
                      onChange={(imageData) => setNewProduct({ ...newProduct, image: imageData })}
                      onRemove={() => setNewProduct({ ...newProduct, image: '' })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      required
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add Product</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    {editingProduct?.id === product.id ? (
                      <div className="p-4 space-y-3">
                        <ImageUpload
                          value={editingProduct.image}
                          onChange={(imageData) => setEditingProduct({ ...editingProduct, image: imageData })}
                          onRemove={() => setEditingProduct({ ...editingProduct, image: '' })}
                        />
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="Product name"
                        />
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          placeholder="Price"
                        />
                        <Textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          placeholder="Description"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProduct} size="sm">
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button onClick={() => setEditingProduct(null)} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
                        <div className="p-4">
                          <h3 className="font-semibold mb-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2 capitalize">{product.category}</p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-primary">₹{product.price}</span>
                            {product.rating && (
                              <span className="text-xs text-muted-foreground">⭐ {product.rating}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Transaction History</h2>
                {newOrdersCount > 0 && (
                  <div className="bg-green-100 border border-green-300 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''}!
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{order.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id} • {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium">Customer Details:</p>
                          <p>{order.customerName}</p>
                          <p>{order.phone}</p>
                          {order.email && <p>{order.email}</p>}
                        </div>
                        <div>
                          <p className="font-medium">Delivery Address:</p>
                          <p>{order.address}</p>
                          <p>{order.city}, {order.state} - {order.pincode}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="font-medium">Quantity:</span> {order.quantity}
                          {order.notes && <p className="text-muted-foreground">Notes: {order.notes}</p>}
                        </div>
                        <span className="text-lg font-bold text-primary">
                          ₹{order.productPrice * order.quantity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Button onClick={() => setShowAddPayment(!showAddPayment)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              {showAddPayment && (
                <form onSubmit={handleAddPayment} className="bg-muted p-4 rounded-lg mb-6 space-y-4">
                  <div>
                    <Label>Payment Type *</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="upi"
                          checked={newPayment.type === 'upi'}
                          onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value as 'upi' })}
                        />
                        <span>UPI Payment</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="bank"
                          checked={newPayment.type === 'bank'}
                          onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value as 'bank' })}
                        />
                        <span>Bank Transfer</span>
                      </label>
                    </div>
                  </div>

                  {newPayment.type === 'upi' ? (
                    <>
                      <div>
                        <Label htmlFor="upiId">UPI ID *</Label>
                        <Input
                          id="upiId"
                          required
                          placeholder="yourname@upi"
                          value={newPayment.upiId}
                          onChange={(e) => setNewPayment({ ...newPayment, upiId: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>QR Code Image</Label>
                        <ImageUpload
                          value={newPayment.qrCode}
                          onChange={(imageData) => setNewPayment({ ...newPayment, qrCode: imageData })}
                          onRemove={() => setNewPayment({ ...newPayment, qrCode: '' })}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          required
                          value={newPayment.bankName}
                          onChange={(e) => setNewPayment({ ...newPayment, bankName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          required
                          value={newPayment.accountNumber}
                          onChange={(e) => setNewPayment({ ...newPayment, accountNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                        <Input
                          id="ifscCode"
                          required
                          value={newPayment.ifscCode}
                          onChange={(e) => setNewPayment({ ...newPayment, ifscCode: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountHolder">Account Holder Name *</Label>
                        <Input
                          id="accountHolder"
                          required
                          value={newPayment.accountHolder}
                          onChange={(e) => setNewPayment({ ...newPayment, accountHolder: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit">Add Payment Method</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {payments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payment methods added yet</p>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {payment.type === 'upi' ? 'UPI Payment' : 'Bank Transfer'}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                payment.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {payment.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {payment.type === 'upi' ? (
                              <p className="text-sm text-muted-foreground">UPI ID: {payment.upiId}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {payment.bankName} - {payment.accountNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePaymentActive(payment.id)}
                          >
                            {payment.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {payment.type === 'upi' && payment.qrCode && (
                        <div className="mt-3 flex justify-center">
                          <img src={payment.qrCode} alt="QR Code" className="w-32 h-32 border rounded" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Admin Management</h2>
                <Button onClick={() => setShowAddAdmin(!showAddAdmin)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Admin
                </Button>
              </div>

              {showAddAdmin && (
                <form onSubmit={handleAddAdmin} className="bg-muted p-4 rounded-lg mb-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="adminUsername">Username *</Label>
                      <Input
                        id="adminUsername"
                        required
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail">Email *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        required
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminPassword">Password *</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        required
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Create Admin</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{admin.username}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        disabled={admins.length === 1}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <div className="mt-3 bg-muted/50 p-2 rounded text-xs">
                      <p className="text-muted-foreground">Password is securely stored and hidden</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Contact Numbers Management</h2>
                <Button onClick={() => setShowAddContact(!showAddContact)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact Number
                </Button>
              </div>

              {showAddContact && (
                <form onSubmit={handleAddContact} className="bg-muted p-4 rounded-lg mb-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactLabel">Label *</Label>
                      <Input
                        id="contactLabel"
                        required
                        placeholder="e.g., Customer Support, Sales"
                        value={newContact.label}
                        onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">Phone Number *</Label>
                      <Input
                        id="contactNumber"
                        type="tel"
                        required
                        placeholder="+91 XXXXXXXXXX"
                        value={newContact.number}
                        onChange={(e) => setNewContact({ ...newContact, number: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={newContact.isPrimary}
                      onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isPrimary" className="cursor-pointer">Mark as Primary Contact</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add Contact</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddContact(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No contact numbers added yet</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{contact.label}</p>
                            {contact.isPrimary && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.number}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePrimaryContact(contact.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
                <p className="font-medium">ℹ️ Contact numbers are visible to customers</p>
                <p className="text-xs mt-1">These numbers will be displayed on the order form for customer inquiries.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
