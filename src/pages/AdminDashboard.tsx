import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  ArrowLeft,
  Upload,
  Eye
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price: number;
  image_url: string;
  category: string;
  status: string;
  stock: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  total_price: number;
  status: string;
  payment_status: string;
  payment_receipt_url: string;
  created_at: string;
  items: any;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  payment_date: string;
  created_at: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'expenses'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  
  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    cost_price: 0,
    image_url: '',
    category: 'snacks',
    stock: 0
  });

  // New Expense Form
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    description: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchExpenses();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching products', variant: 'destructive' });
      console.error(error);
    } else {
      setProducts(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching orders', variant: 'destructive' });
      console.error(error);
    } else {
      setOrders(data || []);
    }
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('payment_date', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching expenses', variant: 'destructive' });
      console.error(error);
    } else {
      setExpenses(data || []);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      status: 'published'
    }]);

    if (error) {
      toast({ title: 'Error adding product', variant: 'destructive' });
      console.error(error);
    } else {
      toast({ title: 'Product added successfully!' });
      setIsAddingProduct(false);
      setNewProduct({ name: '', description: '', price: 0, cost_price: 0, image_url: '', category: 'snacks', stock: 0 });
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting product', variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted successfully!' });
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error updating order', variant: 'destructive' });
    } else {
      toast({ title: 'Order status updated!' });
      fetchOrders();
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const { error } = await supabase.from('orders').update({ payment_status: 'verified', status: 'confirmed' }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error verifying payment', variant: 'destructive' });
    } else {
      toast({ title: 'Payment verified successfully!' });
      
      // Send SMS to customer
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: order.customer_phone,
          message: `Payment verified for Order #${orderId.slice(0, 8)}. Your order is confirmed and will be shipped soon. Thank you! - Sikkolu Specials`,
          type: 'payment_verified'
        }
      });

      // Generate invoice
      await supabase.functions.invoke('generate-invoice', {
        body: {
          order,
          customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email },
          items: order.items
        }
      });

      fetchOrders();
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    const { error } = await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error rejecting payment', variant: 'destructive' });
    } else {
      toast({ title: 'Payment rejected' });
      fetchOrders();
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('expenses').insert([newExpense]);
    if (error) {
      toast({ title: 'Error adding expense', variant: 'destructive' });
    } else {
      toast({ title: 'Expense added successfully!' });
      setNewExpense({ category: '', amount: 0, description: '', payment_date: new Date().toISOString().split('T')[0] });
      setIsAddingExpense(false);
      fetchExpenses();
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting expense', variant: 'destructive' });
    } else {
      toast({ title: 'Expense deleted!' });
      fetchExpenses();
    }
  };

  // Analytics Calculations
  const totalRevenue = orders.filter(o => o.payment_status === 'verified').reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  // Net Profit = Revenue - Expenses - Product Costs
  const productCosts = orders.filter(o => o.payment_status === 'verified').reduce((sum, order) => {
    const orderCost = (order.items || []).reduce((itemSum: number, item: any) => {
      const product = products.find(p => p.id === item.id);
      return itemSum + ((product?.cost_price || 0) * (item.quantity || 1));
    }, 0);
    return sum + orderCost;
  }, 0);
  
  const netProfit = totalRevenue - totalExpenses - productCosts;

  // Daily revenue for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyRevenue = last7Days.map(date => {
    const dayOrders = orders.filter(o => 
      o.created_at.startsWith(date) && o.payment_status === 'verified'
    );
    return {
      date: date.split('-')[2] + '/' + date.split('-')[1],
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_price), 0),
      orders: dayOrders.length
    };
  });

  // Category distribution
  const categoryData = products.reduce((acc: any, product) => {
    const cat = product.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Sikkolu Specials Admin</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={activeTab === 'products' ? 'default' : 'outline'}
                onClick={() => setActiveTab('products')}
              >
                Products
              </Button>
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </Button>
              <Button 
                variant={activeTab === 'expenses' ? 'default' : 'outline'}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From verified orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{netProfit.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Revenue - Costs - Expenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="w-4 h-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">Total products</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
                      <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Products by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <Button onClick={() => setIsAddingProduct(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            {isAddingProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Product Name*</Label>
                      <Input 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="e.g., Srikakulam Halwa"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        <option value="snacks">Snacks</option>
                        <option value="sweets">Sweets</option>
                        <option value="pickles">Pickles</option>
                        <option value="handicrafts">Handicrafts</option>
                      </select>
                    </div>
                    <div>
                      <Label>Selling Price (₹)*</Label>
                      <Input 
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Cost Price (₹)</Label>
                      <Input 
                        type="number"
                        value={newProduct.cost_price}
                        onChange={(e) => setNewProduct({...newProduct, cost_price: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Stock Quantity</Label>
                      <Input 
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input 
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct}>Add Product</Button>
                    <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{product.price}</td>
                      <td className="px-6 py-4">₹{product.cost_price}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">₹{product.price - product.cost_price}</td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{order.total_price}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.payment_status === 'verified' ? 'bg-green-100 text-green-800' : 
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.payment_status}
                          </span>
                          {order.payment_receipt_url && (
                            <a href={order.payment_receipt_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="text-sm border rounded px-2 py-1"
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
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
                        {order.payment_status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleVerifyPayment(order.id)}
                              className="bg-green-600"
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectPayment(order.id)}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Business Expenses</h2>
              <Button onClick={() => setIsAddingExpense(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>

            {isAddingExpense && (
              <Card>
                <CardHeader>
                  <CardTitle>Record New Expense</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category*</Label>
                      <select 
                        className="w-full border rounded-md p-2"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                      >
                        <option value="">Select category</option>
                        <option value="inventory">Inventory Purchase</option>
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="marketing">Marketing</option>
                        <option value="salary">Salary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label>Amount (₹)*</Label>
                      <Input 
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Payment Date</Label>
                      <Input 
                        type="date"
                        value={newExpense.payment_date}
                        onChange={(e) => setNewExpense({...newExpense, payment_date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Expense details..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddExpense}>Add Expense</Button>
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="text-2xl font-bold text-red-600">Total Expenses: ₹{totalExpenses.toFixed(2)}</div>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-6 py-4 text-sm">{new Date(expense.payment_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{expense.description || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-red-600">₹{expense.amount}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
