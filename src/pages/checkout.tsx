import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QrCode, Banknote, UploadCloud, CheckCircle, Package, Truck, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // 1. Load Admin Settings (UPI/Bank)
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSubmitOrder = async () => {
    if (!receipt) return toast({ title: "Please upload screenshot" });
    setIsUploading(true);

    try {
      // Receipt Upload to 'Receipts' bucket
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: upError } = await supabase.storage.from('Receipts').upload(fileName, receipt);
      if (upError) throw upError;

      const { data: urlData } = supabase.storage.from('Receipts').getPublicUrl(fileName);

      // Create Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        customer_name: customer.name,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        total_price: 1499, // Dynamic ga nee cart nundi tiskovachu
        status: 'pending',
        payment_receipt_url: urlData.publicUrl,
        items: { note: "Sikkolu Specials Order" }
      }]).select().single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);
      setStep(3);
    } catch (err) {
      toast({ title: "Order Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8">
        
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Shipping Details</h2>
            <div className="space-y-4">
              <Input placeholder="Full Name" onChange={e => setCustomer({...customer, name: e.target.value})} />
              <Input placeholder="Phone Number" onChange={e => setCustomer({...customer, phone: e.target.value})} />
              <textarea className="w-full border rounded-xl p-3 h-28" placeholder="Full Address" onChange={e => setCustomer({...customer, address: e.target.value})} />
              <Button onClick={() => setStep(2)} className="w-full bg-blue-600 h-14">Proceed to Payment</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold">Scan & Pay</h2>
            <div className="bg-gray-100 p-4 rounded-2xl inline-block border-2 border-dashed">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${settings.upi_id}&pn=Store&cu=INR`} className="mx-auto" />
            </div>
            <p className="font-mono font-bold text-blue-600">{settings.upi_id}</p>
            
            <div className="text-left bg-blue-50 p-4 rounded-xl text-sm">
               <strong>Bank Details:</strong><br/>{settings.bank_details}
            </div>

            <div className="border-2 border-dashed p-6 rounded-2xl relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
              <UploadCloud className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs">{receipt ? receipt.name : "Upload Payment Screenshot"}</p>
            </div>

            <Button onClick={handleSubmitOrder} disabled={isUploading} className="w-full bg-green-600 h-14">
              {isUploading ? "Processing..." : "Confirm Payment & Order"}
            </Button>
            <button onClick={() => setStep(1)} className="text-sm text-gray-400">Back to Details</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-10">
            <CheckCircle className="mx-auto text-green-500" size={64} />
            <h2 className="text-3xl font-bold">Order Success!</h2>
            <p className="text-gray-500">Order ID: #{orderId.slice(0,8)}</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">Back to Home</Button>
          </div>
        )}

      </div>
    </div>
  );
}
