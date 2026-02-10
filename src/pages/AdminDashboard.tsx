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
  Eye,
  Shield
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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'expenses' | 'settings' | 'categories' | 'admins'>('overview');
  const [admin, setAdmin] = useState<any>(null);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Check admin authentication
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      toast({ title: 'Unauthorized access', variant: 'destructive' });
      navigate('/admin-login');
      return;
    }
    setAdmin(JSON.parse(adminData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    toast({ title: 'Logged out successfully' });
    navigate('/');
  };
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

  // Payment Settings State
  const [settings, setSettings] = useState({
    upi_id: '',
    bank_details: '',
    qr_code_url: '',
    admin_phone: ''
  });
  const [qrUpload, setQrUpload] = useState<File | null>(null);
  const [isAddingManualPayment, setIsAddingManualPayment] = useState(false);
  const [manualPayment, setManualPayment] = useState({
    type: 'income',
    amount: 0,
    description: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Category Management State
  const [categories, setCategories] = useState<string[]>(['snacks', 'sweets', 'pickles', 'handicrafts']);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Admin Management State
  const [admins, setAdmins] = useState<any[]>([]);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', name: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchExpenses();
    fetchSettings();
    fetchAdmins();
    loadCategories();
  }, []);

  const loadCategories = () => {
    // Extract unique categories from products
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    if (uniqueCategories.length > 0) {
      setCategories(uniqueCategories as string[]);
    }
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase.from('admin_users').select('id, username, name, created_at').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching admins:', error);
    } else {
      setAdmins(data || []);
    }
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettings({
        upi_id: data.upi_id || '',
        bank_details: data.bank_details || '',
        qr_code_url: data.qr_code_url || '',
        admin_phone: data.admin_phone || ''
      });
    }
  };

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

  // Image compression utility
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large (max 1200px)
          const maxSize = 1200;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    toast({ title: '⏳ Compressing and uploading image...', description: 'Please wait' });
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `product_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      toast({ title: '✓ Image uploaded successfully!', description: 'Compressed and optimized' });
      return data.publicUrl;
    } catch (err: any) {
      toast({ title: 'Image upload failed', variant: 'destructive' });
      console.error(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    let imageUrl = newProduct.image_url;
    
    // Upload image if file selected
    if (imageUpload) {
      imageUrl = await handleImageUpload(imageUpload) || '';
      if (!imageUrl) return; // Cancel if upload failed
    }

    const { error } = await supabase.from('products').insert([{
      ...newProduct,
      image_url: imageUrl,
      status: 'published'
    }]);

    if (error) {
      toast({ title: 'Error adding product', variant: 'destructive' });
      console.error(error);
    } else {
      toast({ title: '✓ Product added successfully!', description: `${newProduct.name} is now live` });
      setIsAddingProduct(false);
      setNewProduct({ name: '', description: '', price: 0, cost_price: 0, image_url: '', category: 'snacks', stock: 0 });
      setImageUpload(null);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: '❌ Error deleting product', variant: 'destructive' });
    } else {
      toast({ title: '✓ Product deleted successfully!', description: 'Product removed from store' });
      fetchProducts();
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({ title: 'Enter category name', variant: 'destructive' });
      return;
    }
    if (categories.includes(newCategory.toLowerCase())) {
      toast({ title: 'Category already exists', variant: 'destructive' });
      return;
    }
    setCategories([...categories, newCategory.toLowerCase()]);
    toast({ title: '✓ Category added!', description: `"${newCategory}" is now available` });
    setNewCategory('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (category: string) => {
    const productsInCategory = products.filter(p => p.category === category).length;
    if (productsInCategory > 0) {
      if (!confirm(`${productsInCategory} products use this category. Delete anyway?`)) return;
    }
    setCategories(categories.filter(c => c !== category));
    toast({ title: '✓ Category deleted!', description: `"${category}" removed` });
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password || !newAdmin.name) {
      toast({ title: 'Fill all admin fields', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('auth-admin', {
        body: {
          action: 'register',
          username: newAdmin.username,
          password: newAdmin.password,
          name: newAdmin.name
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || error.message);
      }

      toast({ title: '✓ New admin added!', description: `${newAdmin.name} can now access dashboard` });
      setNewAdmin({ username: '', password: '', name: '' });
      setIsAddingAdmin(false);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: '❌ Failed to add admin', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (admin?.id === adminId) {
      toast({ title: 'Cannot delete yourself!', variant: 'destructive' });
      return;
    }
    if (!confirm(`Delete admin "${adminName}"? This cannot be undone.`)) return;

    const { error } = await supabase.from('admin_users').delete().eq('id', adminId);
    if (error) {
      toast({ title: '❌ Error deleting admin', variant: 'destructive' });
    } else {
      toast({ title: '✓ Admin deleted', description: `${adminName} removed` });
      fetchAdmins();
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast({ title: 'Error updating order', variant: 'destructive' });
    } else {
      toast({ title: '✓ Order status updated!', description: `Changed to ${newStatus}` });
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
      toast({ title: '✓ Payment verified!', description: 'Customer will receive SMS confirmation' });
      
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
      toast({ title: '✓ Expense recorded!', description: `₹${newExpense.amount} added to expenses` });
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

  const handleQrUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr_code_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err: any) {
      toast({ title: 'QR upload failed', variant: 'destructive' });
      console.error(err);
      return null;
    }
  };

  const handleSaveSettings = async () => {
    setUploading(true);
    try {
      let qrUrl = settings.qr_code_url;
      
      if (qrUpload) {
        qrUrl = await handleQrUpload(qrUpload) || '';
        if (!qrUrl) {
          setUploading(false);
          return;
        }
      }

      const { error } = await supabase.from('site_settings').update({
        upi_id: settings.upi_id,
        bank_details: settings.bank_details,
        qr_code_url: qrUrl,
        admin_phone: settings.admin_phone
      }).eq('id', 'master_config');

      if (error) throw error;

      toast({ title: '✓ Payment settings saved!', description: 'QR code and UPI details updated' });
      setQrUpload(null);
      fetchSettings();
    } catch (err: any) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAddManualPayment = async () => {
    if (!manualPayment.amount || !manualPayment.description) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('expenses').insert([{
      category: manualPayment.type === 'income' ? 'manual_income' : 'manual_expense',
      amount: manualPayment.type === 'income' ? -Math.abs(manualPayment.amount) : Math.abs(manualPayment.amount),
      description: manualPayment.description,
      payment_date: manualPayment.payment_date,
      created_by: 'admin'
    }]);

    if (error) {
      toast({ title: 'Error recording payment', variant: 'destructive' });
    } else {
      toast({ title: `Manual ${manualPayment.type} recorded!` });
      setManualPayment({ type: 'income', amount: 0, description: '', payment_date: new Date().toISOString().split('T')[0] });
      setIsAddingManualPayment(false);
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-[#800000] to-[#600000] text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-[#D4AF37] hover:text-[#800000] h-10 w-10 p-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Admin Dashboard</h1>
                {admin && <p className="text-xs text-[#D4AF37] hidden md:block">{admin.name}</p>}
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-red-600 h-10 px-3">
              <span className="hidden md:inline">Logout</span>
              <span className="md:hidden text-xl">×</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Tab Navigation (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border-b shadow-sm sticky top-16 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'bg-[#800000]' : ''}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === 'products' ? 'default' : 'outline'}
              onClick={() => setActiveTab('products')}
              className={activeTab === 'products' ? 'bg-[#800000]' : ''}
            >
              Products
            </Button>
            <Button 
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              onClick={() => setActiveTab('categories')}
              className={activeTab === 'categories' ? 'bg-[#800000]' : ''}
            >
              Categories
            </Button>
            <Button 
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'bg-[#800000]' : ''}
            >
              Orders
            </Button>
            <Button 
              variant={activeTab === 'expenses' ? 'default' : 'outline'}
              onClick={() => setActiveTab('expenses')}
              className={activeTab === 'expenses' ? 'bg-[#800000]' : ''}
            >
              Expenses
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('settings')}
              className={activeTab === 'settings' ? 'bg-[#800000]' : ''}
            >
              Settings
            </Button>
            <Button 
              variant={activeTab === 'admins' ? 'default' : 'outline'}
              onClick={() => setActiveTab('admins')}
              className={activeTab === 'admins' ? 'bg-[#800000]' : ''}
            >
              Admins
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#D4AF37] shadow-2xl z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Products</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-[#800000] text-white' : 'text-gray-600'}`}
          >
            <ShoppingCart className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">Orders</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-gray-600"
          >
            <div className="w-6 h-6 mb-1 flex flex-col justify-center gap-1">
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
            </div>
            <span className="text-xs font-semibold">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 text-[#800000]">More Options</h3>
            <div className="space-y-2">
              <button
                onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-3"
              >
                <Package className="w-5 h-5 text-[#800000]" />
                Categories
              </button>
              <button
                onClick={() => { setActiveTab('expenses'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-3"
              >
                <DollarSign className="w-5 h-5 text-[#800000]" />
                Expenses
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-3"
              >
                <Upload className="w-5 h-5 text-[#800000]" />
                Payment Settings
              </button>
              <button
                onClick={() => { setActiveTab('admins'); setIsMobileMenuOpen(false); }}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-3"
              >
                <Shield className="w-5 h-5 text-[#800000]" />
                Manage Admins
              </button>
            </div>
          </div>
        </div>
      )}

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
                        className="w-full border rounded-md p-2 h-12"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
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
                    <div className="col-span-2">
                      <Label>Product Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          id="product-image-upload"
                          onChange={(e) => setImageUpload(e.target.files?.[0] || null)} 
                        />
                        <label htmlFor="product-image-upload" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm font-semibold">
                            {imageUpload ? '✓ ' + imageUpload.name : 'Click to upload product image'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Or paste image URL below</p>
                        </label>
                      </div>
                      <Input 
                        className="mt-2"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        placeholder="Or paste image URL (https://...)"
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
                    <Button onClick={handleAddProduct} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Add Product'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="w-10 h-10 md:w-12 md:h-12 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-medium text-sm md:text-base">{product.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 font-semibold text-sm md:text-base">₹{product.price}</td>
                      <td className="hidden md:table-cell px-6 py-4">₹{product.cost_price}</td>
                      <td className="hidden md:table-cell px-6 py-4 text-green-600 font-semibold">₹{product.price - product.cost_price}</td>
                      <td className="px-3 md:px-6 py-4">{product.stock}</td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:bg-red-50 h-10 w-10 p-0 md:h-8 md:w-8"
                        >
                          <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
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
            
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 text-xs md:text-sm font-mono">#{order.id.slice(0, 8)}</td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="text-xs md:text-sm font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </td>
                      <td className="px-3 md:px-6 py-4 font-semibold text-sm md:text-base">₹{order.total_price}</td>
                      <td className="px-3 md:px-6 py-4">
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
                              <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
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
                      <td className="px-3 md:px-6 py-4">
                        {order.payment_status === 'pending' && (
                          <div className="flex gap-1 md:gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleVerifyPayment(order.id)}
                              className="bg-green-600 hover:bg-green-700 h-10 px-2 md:h-8 md:px-3"
                            >
                              <Check className="w-5 h-5 md:w-4 md:h-4 md:mr-1" />
                              <span className="hidden md:inline">Approve</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectPayment(order.id)}
                              className="h-10 px-2 md:h-8 md:px-3"
                            >
                              <X className="w-5 h-5 md:w-4 md:h-4 md:mr-1" />
                              <span className="hidden md:inline">Reject</span>
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

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#800000]">Category Management</h2>
              <Button onClick={() => setIsAddingCategory(true)} className="bg-[#800000] hover:bg-[#600000] h-12 md:h-10">
                <Plus className="w-5 h-5 mr-2" /> Add Category
              </Button>
            </div>

            {isAddingCategory && (
              <Card className="border-2 border-[#D4AF37]">
                <CardHeader className="bg-gradient-to-r from-[#800000] to-[#600000] text-white">
                  <CardTitle>Create New Category</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-[#800000] font-semibold">Category Name*</Label>
                    <Input 
                      placeholder="e.g., Traditional Clothes"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="border-2 border-[#D4AF37] focus:border-[#800000] h-12"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCategory} className="bg-[#800000] hover:bg-[#600000] h-12 flex-1">
                      ✓ Add Category
                    </Button>
                    <Button variant="outline" onClick={() => { setIsAddingCategory(false); setNewCategory(''); }} className="h-12 flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const productCount = products.filter(p => p.category === category).length;
                return (
                  <Card key={category} className="border-2 border-[#D4AF37] hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#800000] capitalize mb-2">{category}</h3>
                          <p className="text-sm text-gray-600">
                            {productCount} product{productCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:bg-red-50 h-10 w-10 p-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {categories.length === 0 && (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-xl font-semibold text-gray-600">No categories yet</p>
                  <p className="text-sm text-gray-500 mt-2">Create your first category to organize products</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#800000]">Admin Management</h2>
              <Button onClick={() => setIsAddingAdmin(true)} className="bg-[#800000] hover:bg-[#600000] h-12 md:h-10">
                <Plus className="w-5 h-5 mr-2" /> Add Admin
              </Button>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">⚠️ Security Notice</p>
              <p className="text-xs text-yellow-700 mt-1">Only the super admin (you) can delete other admin accounts. Be careful when granting admin access.</p>
            </div>

            {isAddingAdmin && (
              <Card className="border-2 border-[#D4AF37]">
                <CardHeader className="bg-gradient-to-r from-[#800000] to-[#600000] text-white">
                  <CardTitle>Create New Admin Account</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#800000] font-semibold">Full Name*</Label>
                      <Input 
                        placeholder="Admin's full name"
                        value={newAdmin.name}
                        onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                        className="border-2 border-[#D4AF37] h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-[#800000] font-semibold">Username*</Label>
                      <Input 
                        placeholder="Login username"
                        value={newAdmin.username}
                        onChange={e => setNewAdmin({...newAdmin, username: e.target.value})}
                        className="border-2 border-[#D4AF37] h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#800000] font-semibold">Password*</Label>
                    <Input 
                      type="password"
                      placeholder="Create secure password (min 6 characters)"
                      value={newAdmin.password}
                      onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                      className="border-2 border-[#D4AF37] h-12"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAdmin} className="bg-[#800000] hover:bg-[#600000] h-12 flex-1">
                      ✓ Create Admin
                    </Button>
                    <Button variant="outline" onClick={() => { setIsAddingAdmin(false); setNewAdmin({ username: '', password: '', name: '' }); }} className="h-12 flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map((adminUser) => (
                <Card key={adminUser.id} className="border-2 border-[#D4AF37] hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-[#800000] p-3 rounded-full">
                          <Shield className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[#800000]">{adminUser.name}</h3>
                          <p className="text-sm text-gray-600 font-mono">@{adminUser.username}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(adminUser.created_at).toLocaleDateString()}
                          </p>
                          {admin?.id === adminUser.id && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                              YOU (SUPER ADMIN)
                            </span>
                          )}
                        </div>
                      </div>
                      {admin?.id !== adminUser.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteAdmin(adminUser.id, adminUser.name)}
                          className="text-red-600 hover:bg-red-50 h-10 w-10 p-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {admins.length === 0 && (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="text-center py-16">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-xl font-semibold text-gray-600">No admins found</p>
                  <p className="text-sm text-gray-500 mt-2">Add admins to help manage the store</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>UPI & Bank Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>UPI ID*</Label>
                      <Input 
                        placeholder="yourname@paytm"
                        value={settings.upi_id}
                        onChange={e => setSettings({...settings, upi_id: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Admin Contact Phone</Label>
                      <Input 
                        placeholder="+91-9876543210"
                        value={settings.admin_phone}
                        onChange={e => setSettings({...settings, admin_phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Bank Details</Label>
                      <Textarea 
                        rows={5}
                        placeholder="Bank Name: SBI&#10;Account Number: 123456789&#10;IFSC Code: SBIN0001234&#10;Account Holder: Your Name"
                        value={settings.bank_details}
                        onChange={e => setSettings({...settings, bank_details: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Upload Payment QR Code</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          id="qr-upload"
                          onChange={(e) => setQrUpload(e.target.files?.[0] || null)} 
                        />
                        <label htmlFor="qr-upload" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                          <p className="text-sm font-semibold">
                            {qrUpload ? '✓ ' + qrUpload.name : 'Click to upload QR code'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PhonePe/GPay/Paytm QR</p>
                        </label>
                      </div>
                      {settings.qr_code_url && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2">Current QR Code:</p>
                          <img src={settings.qr_code_url} alt="Payment QR" className="w-48 h-48 mx-auto border-2 border-gray-300 rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={uploading} className="w-full md:w-auto">
                  {uploading ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Manual Payment Records</CardTitle>
                  <Button onClick={() => setIsAddingManualPayment(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Manual Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingManualPayment && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type*</Label>
                        <select 
                          className="w-full border rounded-md p-2"
                          value={manualPayment.type}
                          onChange={(e) => setManualPayment({...manualPayment, type: e.target.value})}
                        >
                          <option value="income">Income (Offline Sale)</option>
                          <option value="expense">Expense (Cash Payment)</option>
                        </select>
                      </div>
                      <div>
                        <Label>Amount (₹)*</Label>
                        <Input 
                          type="number"
                          value={manualPayment.amount}
                          onChange={(e) => setManualPayment({...manualPayment, amount: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input 
                          type="date"
                          value={manualPayment.payment_date}
                          onChange={(e) => setManualPayment({...manualPayment, payment_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Description*</Label>
                        <Input 
                          placeholder="e.g., Cash sale to local customer"
                          value={manualPayment.description}
                          onChange={(e) => setManualPayment({...manualPayment, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddManualPayment}>
                        Record Payment
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingManualPayment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Use this to record offline sales (bank transfers, cash) or manual expenses that don't go through the website.
                </p>
              </CardContent>
            </Card>
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
