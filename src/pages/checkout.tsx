import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QrCode, Banknote, UploadCloud, CheckCircle, Package, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success/Tracking
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cart total - Idi nee logic nundi tiskuntundi
  const totalAmount = 1499; 

  // Load Admin Settings (UPI/Bank)
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  // 1. Order Place & Payment Setup
  const handlePlaceOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      return toast({ title: "Please fill all details" });
    }
    setStep(2);
  };

  // 2. Receipt Upload & Final Submit
  const handleSubmitPayment = async () => {
    if (!receipt) return toast({ title: "Please upload payment screenshot" });
    setIsUploading(true);

    try {
      // Upload Receipt
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: upData, error: upError } = await supabase.storage.from('receipts').upload(fileName, receipt);
      if (upError) throw upError;

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

      // Create Order in Database
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        customer_name: customer.name,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        total_price: totalAmount,
        status: 'pending',
        payment_receipt_url: urlData.publicUrl,
        items: { items: "Your Cart Items" } 
      }]).select().single();

      if (orderError) throw orderError;

      setCurrentOrder(orderData);
      setStep(3);
      toast({ title: "Order Placed Successfully!" });
    } catch (err) {
      toast({ title: "Error", description: "Payment upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* STEP 1: ADDRESS DETAILS */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h2 className="text-2xl font-bold border-b pb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} placeholder="9876543210" />
              </div>
              <div className="grid gap-2">
                <Label>Full Address</Label>
                <textarea className="w-full border rounded-xl p-3 h-28 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} 
                  placeholder="House No, Street, Landmark, Pincode" />
              </div>
              <Button onClick={handlePlaceOrder} className="w-full bg-blue-600 h-14 text-lg">Next: Payment</Button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT & QR */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border text-center">
              <h3 className="font-bold mb-6 flex items-center justify-center text-xl"><QrCode className="mr-2"/> Scan & Pay</h3>
              <div className="bg-slate-100 p-4 rounded-2xl inline-block mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${settings.upi_id}&pn=Store&am=${totalAmount}&cu=INR`} 
                  alt="QR" className="w-48 h-48 mx-auto" 
                />
              </div>
              <p className="text-blue-600 font-bold font-mono text-lg">{settings.upi_id}</p>
              <div className="mt-8 pt-6 border-t text-left">
                <h4 className="font-bold mb-2 flex items-center text-sm"><Banknote className="mr-2 w-4 h-4"/> Bank Details</h4>
                <p className="text-xs text-slate-500 whitespace-pre-line">{settings.bank_details}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
              <h3 className="font-bold text-xl">Upload Screenshot</h3>
              <p className="text-sm text-slate-500">Payment ayyaka screenshot ni ikkada upload cheyandi.</p>
              <div className="border-2 border-dashed rounded-2xl p-10 text-center relative hover:bg-slate-50">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                <UploadCloud className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-sm font-medium">{receipt ? receipt.name : "Select Receipt Image"}</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-xl mb-4"><span>Total:</span><span>₹{totalAmount}</span></div>
                <Button onClick={handleSubmitPayment} disabled={isUploading} className="w-full bg-green-600 h-14">
                  {isUploading ? "Processing..." : "Submit & Place Order"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUCCESS & LIVE TRACKING */}
        {step === 3 && currentOrder && (
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border text-center space-y-8">
            <div className="space-y-2">
              <CheckCircle className="mx-auto text-green-500" size={64} />
              <h2 className="text-3xl font-bold">Order Received!</h2>
              <p className="text-slate-500 font-mono text-sm uppercase">Order ID: #{currentOrder.id.slice(0,8)}</p>
            </div>

            {/* LIVE TRACKING BAR */}
            <div className="max-w-md mx-auto py-8">
              <div className="relative flex justify-between items-center">
                <div className="absolute h-1 bg-slate-200 w-full top-1/2 -translate-y-1/2 -z-0"></div>
                <div className={`h-1 bg-green-500 absolute top-1/2 -translate-y-1/2 transition-all duration-500 -z-0 ${
                  currentOrder.status === 'pending' ? 'w-[10%]' : 
                  currentOrder.status === 'shipped' ? 'w-[60%]' : 'w-full'
                }`}></div>

                {['Pending', 'Shipped', 'Delivered'].map((label, i) => (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      (i === 0) || (i === 1 && currentOrder.status === 'shipped') || (i === 2 && currentOrder.status === 'delivered')
                      ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {i === 0 ? <Package size={16}/> : i === 1 ? <Truck size={16}/> : <Check size={16}/>}
                    </div>
                    <span className="text-[10px] font-bold mt-2 uppercase">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-2">
              <p className="text-sm"><strong>Status:</strong> {currentOrder.status.toUpperCase()}</p>
              <p className="text-sm"><strong>Tracking ID:</strong> {currentOrder.tracking_id || "Awaiting Shipment"}</p>
            </div>

            <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full h-12">Return to Shop</Button>
          </div>
        )}
      </div>
    </div>
  );
}
