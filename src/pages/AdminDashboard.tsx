import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { notifications } from '@/lib/notifications';
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, 
  Plus, Save, Trash2, Eye, EyeOff, CheckCircle, XCircle, 
  Receipt, Truck, CreditCard, UserPlus, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Product, Order } from '@/types';

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. DATA LOAD & REAL-TIME LISTENING
  useEffect(() => {
    fetchAllData();

    // Live Order Notification Listener
    const orderSubscription = supabase
      .channel('admin_live_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        notifications.playSound();
        notifications.showNotification("New Order Received! 🛒", `Order for ₹${payload.new.total_price} just came in.`);
        fetchAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    const { data: prod } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: ord } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: sett } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();

    if (prod) setProducts(prod);
    if (ord) setOrders(ord);
    if (sett) setSettings({ upi_id: sett.upi_id, bank_details: sett.bank_details });
    setIsLoading(false);
  };

  // 2. PRODUCT ACTIONS
  const toggleProductVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast({ title: `Product moved to ${newStatus}` });
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Ee product ni delete cheyamantara?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
        toast({ title: "Product Deleted" });
      }
    }
  };

  // 3. ORDER & TRACKING ACTIONS
  const updateOrder = async (orderId: string, status: string, trackingId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, tracking_id: trackingId })
      .eq('id', orderId);

    if (!error) {
      toast({ title: "Order Updated", description: "Customer can see the status now." });
      fetchAllData();
    }
  };

  // 4. SETTINGS ACTIONS
  const saveSettings = async () => {
    const { error } = await supabase
      .from('site_settings')
      .update({ upi_id: settings.upi_id, bank_details: settings.bank_details })
      .eq('id', 'master_config');

    if (!error) {
      toast({ title: "Settings Saved Live!" });
    } else {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-10 text-blue-400">
          <LayoutDashboard size={28} />
          <span className="text-xl font-bold text-white">Store Admin</span>
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('orders')} className={
