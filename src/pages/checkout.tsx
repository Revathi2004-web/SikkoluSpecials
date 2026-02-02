import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QrCode, Banknote, UploadCloud, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '' });
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock total amount - idi nee cart nundi ravali
  const totalAmount = 1499; 

  // Admin Dashboard settings nundi UPI ID tiskuntundi
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  // Dynamic QR Code generation based on Admin UPI ID
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${settings.upi_id}&pn=SikkoluStore&am=${totalAmount}&cu=INR`;

  const handlePlaceOrder = async () => {
    if (!receipt) return toast({ title: "Please upload payment screenshot" });
    setIsUploading(true);

    try {
      // 1. Upload Receipt to Supabase Storage
      const fileExt = receipt.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receipt);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

      // 2. Save Order to Database
      const { error: orderError } = await supabase.from('orders').insert([{
        customer_name: customer.name,
        total_price: totalAmount,
        status: 'pending',
        payment_receipt_url: urlData.publicUrl,
        items: { note: "Sample Items" } // Cart items ikkada add cheyali
      }]);

      if (orderError) throw orderError;

      setStep(3); // Success Step
      toast({ title: "Order Placed Successfully!" });
    } catch (err) {
      toast({ title: "Order failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
            <h2 className="text-2xl font-bold">Delivery Details</h2>
            <div className="grid gap-4">
              <div><Label>Full Name</Label><Input placeholder="Enter your name" onChange={e => setCustomer({...customer, name: e.target.value})} /></div>
              <div><Label>Phone Number</Label><Input placeholder="Mobile number" onChange={e => setCustomer({...customer, phone: e.target.value})} /></div>
              <div><Label>Full Address</Label><textarea className="w-full border rounded-md p-2 h-24" onChange={e => setCustomer({...customer, address: e.target.value})} /></div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-blue-600 h-12">Proceed to Payment</Button>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: QR & Bank */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border text-center">
              <h3 className="font-bold mb-4 flex items-center justify-center"><QrCode className="mr-2"/> Scan & Pay</h3>
              <div className="bg-slate-50 p-4 rounded-2xl inline-block mb-4">
                <img src={qrUrl} alt="UPI QR" className="w-48 h-48 mx-auto" />
              </div>
              <p className="font-mono text-blue-600 font-bold">{settings.upi_id}</p>
              
              <div className="mt-8 pt-6 border-t text-left">
                <h4 className="text-sm font-bold flex items-center mb-2"><Banknote className="mr-2 w-4 h-4"/> Bank Details</h4>
                <pre className="text-xs text-slate-500 whitespace-pre-wrap">{settings.bank_details}</pre>
              </div>
            </div>

            {/* Right: Upload */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col justify-between">
              <div>
                <h3 className="font-bold mb-4">Upload Receipt</h3>
                <p className="text-sm text-slate-500 mb-6">Payment chesina tarvata screenshot ni ikkada upload cheyandi.</p>
                <div className="border-2 border-dashed rounded-2xl p-8 text-center relative hover:bg-slate-50 cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                  <UploadCloud className="mx-auto text-slate-300 mb-2" size={40} />
                  <p className="text-sm">{receipt ? receipt.name : "Select Screenshot"}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>₹{totalAmount}</span></div>
                <Button onClick={handlePlaceOrder} disabled={isUploading} className="w-full bg-green-600 h-12">
                  {isUploading ? "Placing Order..." : "Confirm & Place Order"}
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-slate-400">Back to details</Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white p-20 rounded-3xl shadow-sm border text-center space-y-4">
            <CheckCircle className="mx-auto text-green-500" size={60} />
            <h2 className="text-3xl font-bold">Order Placed!</h2>
            <p className="text-slate-500">Admin verify chesi nee order ni confirm chestharu. Dashboard lo status check chesko.</p>
            <Button onClick={() => window.location.href = '/'} className="mt-6">Continue Shopping</Button>
          </div>
        )}

      </div>
    </div>
  );
}
