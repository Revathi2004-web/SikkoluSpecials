import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QrCode, Banknote, UploadCloud, CheckCircle, Package, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Status
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Example Amount - Dinni nee Cart logic ki connect chesko
  const totalAmount = 1499; 

  // Admin set chesina UPI & Bank details tiskuntundi
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSubmitPayment = async () => {
    if (!receipt) return toast({ title: "Please upload payment screenshot" });
    if (!customer.name || !customer.phone) return toast({ title: "Details fill cheyandi" });
    
    setIsUploading(true);

    try {
      // 1. Upload Screenshot to 'Receipts' bucket
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: upData, error: upError } = await supabase.storage.from('Receipts').upload(fileName, receipt);
      
      if (upError) throw upError;
      const { data: urlData } = supabase.storage.from('Receipts').getPublicUrl(fileName);

      // 2. Create Order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        customer_name: customer.name,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        total_price: totalAmount,
        status: 'pending',
        payment_receipt_url: urlData.publicUrl,
        items: { note: "Order for Sikkolu Specials" } 
      }]).select().single();

      if (orderError) throw orderError;

      setCurrentOrder(orderData);
      setStep(3); // Go to Tracking
      toast({ title: "Order Successfully Placed!" });
    } catch (err) {
      toast({ title: "Error", description: "Payment upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* STEP 1: DELIVERY DETAILS */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4">Delivery Details</h2>
            <div className="space-y-4">
              <Input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Full Name" />
              <Input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="Phone Number" />
              <textarea className="w-full border rounded-xl p-3 h-28" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} placeholder="Full Address with Pincode" />
              <Button onClick={() => setStep(2)} className="w-full bg-blue-600 h-14 text-lg">Proceed to Payment</Button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT & LIVE QR */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border text-center">
              <h3 className="font-bold mb-6 text-xl flex items-center justify-center"><QrCode className="mr-2"/> Scan to Pay</h3>
              <div className="bg-slate-50 p-4 rounded-2xl inline-block mb-4">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${settings.upi_id}&pn=Store&am=${totalAmount}&cu=INR`} className="w-48 h-48 mx-auto" />
              </div>
              <p className="text-blue-600 font-bold font-mono text-lg">{settings.upi_id}</p>
              <div className="mt-8 pt-6 border-t text-left">
                <h4 className="font-bold mb-2 flex items-center text-sm"><Banknote className="mr-2 w-4 h-4"/> Bank Details</h4>
                <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{settings.bank_details}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <h3 className="font-bold text-xl">Upload Proof</h3>
              <div className="border-2 border-dashed rounded-2xl p-10 text-center relative hover:bg-slate-50 transition">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                <UploadCloud className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-sm font-medium">{receipt ? receipt.name : "Select Screenshot"}</p>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-4"><span>Total Bill:</span><span>₹{totalAmount}</span></div>
              <Button onClick={handleSubmitPayment} disabled={isUploading} className="w-full bg-green-600 h-14">
                {isUploading ? "Placing Order..." : "Confirm & Place Order"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER TRACKING BAR */}
        {step === 3 && currentOrder && (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border text-center space-y-8 animate-in zoom-in duration-300">
            <CheckCircle className="mx-auto text-green-500" size={64} />
            <h2 className="text-3xl font-bold">Order Received!</h2>
            <p className="font-mono text-sm uppercase text-slate-400">Order ID: #{currentOrder.id.slice(0,8)}</p>

            <div className="max-w-md mx-auto py-8">
              <div className="relative flex justify-between items-center">
                <div className="absolute h-1 bg-slate-200 w-full top-1/2 -translate-y-1/2 -z-0"></div>
                <div className="h-1 bg-green-500 absolute top-1/2 -translate-y-1/2 transition-all duration-1000 w-[10%]"></div>
                {['Pending', 'Shipped', 'Delivered'].map((label, i) => (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {i === 0 ? <Package size={18}/> : i === 1 ? <Truck size={18}/> : <Check size={18}/>}
                    </div>
                    <span className="text-[10px] font-bold mt-2 uppercase tracking-tighter">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-2 border border-slate-100">
              <p className="text-sm text-slate-600"><strong>Live Status:</strong> {currentOrder.status.toUpperCase()}</p>
              <p className="text-sm text-slate-600"><strong>Tracking ID:</strong> Awaiting Dispatch</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="w-full h-12">Continue Shopping</Button>
          </div>
        )}
      </div>
    </div>
  );
}
