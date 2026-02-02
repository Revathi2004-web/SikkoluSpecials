import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Eye, EyeOff, ShoppingCart, Package, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: s } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
    if (p) setProducts(p);
    if (o) setOrders(o);
    if (s) setSettings({ upi_id: s.upi_id, bank_details: s.bank_details });
  };

  // PRODUCT ACTIONS
  const handleAddProduct = async () => {
    const { error } = await supabase.from('products').insert([{ ...newProduct, status: 'published' }]);
    if (!error) {
      toast({ title: "Product Added Successfully!" });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', image: '', description: '' });
      fetchData();
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Product Deleted" });
    }
  };

  // SETTINGS ACTION
  const saveSettings = async () => {
    const { error } = await supabase.from('site_settings').update(settings).eq('id', 'master_config');
    if (!error) toast({ title: "Payments Updated Live!" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-8">Sikkolu Admin</h2>
        <button onClick={() => setActiveTab('products')} className={`w-full flex p-3 rounded ${activeTab === 'products' ? 'bg-blue-600' : ''}`}><Package className="mr-2"/> Products</button>
        <button onClick={() => setActiveTab('orders')} className={`w-full flex p-3 rounded ${activeTab === 'orders' ? 'bg-blue-600' : ''}`}><ShoppingCart className="mr-2"/> Orders</button>
        <button onClick={() => setActiveTab('settings')} className={`w-full flex p-3 rounded ${activeTab === 'settings' ? 'bg-blue-600' : ''}`}><Settings className="mr-2"/> Payments</button>
      </nav>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Manage Products</h1>
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-green-600"><Plus className="mr-2"/> Add Product</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow border">
                  <img src={p.image} className="h-40 w-full object-cover rounded-lg mb-4" />
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-blue-600 font-bold">₹{p.price}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 size={16}/></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-lg bg-white p-8 rounded-2xl shadow border">
            <h2 className="text-xl font-bold mb-6">Payment Configuration</h2>
            <div className="space-y-4">
              <div>
                <Label>UPI ID (Direct Payment)</Label>
                <Input value={settings.upi_id} onChange={e => setSettings({...settings, upi_id: e.target.value})} />
              </div>
              <div>
                <Label>Bank Account Details</Label>
                <textarea className="w-full border p-2 rounded h-24" value={settings.bank_details} onChange={e => setSettings({...settings, bank_details: e.target.value})} />
              </div>
              <Button onClick={saveSettings} className="w-full bg-blue-600"><Save className="mr-2"/> Save Changes</Button>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button onClick={() => setIsAddModalOpen(false)}><X/></button>
            </div>
            <div className="space-y-4">
              <Input placeholder="Product Name" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <Input placeholder="Price" type="number" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <Input placeholder="Image URL" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <textarea placeholder="Description" className="w-full border p-2 rounded" onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <Button onClick={handleAddProduct} className="w-full">Save Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
