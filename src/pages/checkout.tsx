import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({ upi_id: '', bank_details: '', admin_phone: '' });
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [customerData, setCustomerData] = useState<any>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const totalAmount = getTotalPrice();

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customer');
    if (storedCustomer) {
      const parsed = JSON.parse(storedCustomer);
      setCustomerData(parsed);
      setCustomer({
        name: parsed.name || '',
        phone: parsed.phone || '',
        email: parsed.email || '',
        address: ''
      });
    }
  }, []);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'master_config').single();
      if (data) setSettings(data);
    }
    loadSettings();

    if (items.length === 0) {
      toast({ title: 'Your cart is empty', variant: 'destructive' });
      setTimeout(() => navigate('/'), 1500);
    }
  }, []);

  const handleSubmitOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      toast({ title: 'Please fill all customer details', variant: 'destructive' });
      return;
    }

    if (!receipt) {
      toast({ title: 'Please upload payment screenshot', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // Upload receipt to Supabase Storage
      const fileExt = receipt.name.split('.').pop();
      const fileName = `receipt_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receipt);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({ title: 'Failed to upload receipt', variant: 'destructive' });
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

      // Create order in database
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        customer_id: customerData?.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        shipping_address: customer.address,
        total_price: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'upi',
        payment_receipt_url: urlData.publicUrl,
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }))
      }]).select().single();

      if (orderError) {
        console.error('Order error:', orderError);
        throw orderError;
      }

      setOrderId(orderData.id);
      clearCart();
      setStep(3);
      toast({ title: 'Order placed successfully!' });

      // Send SMS to customer
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: customer.phone,
          message: `Order #${orderData.id.slice(0, 8)} placed! Total: ₹${totalAmount}. Please complete payment via UPI: ${settings.upi_id}. Upload screenshot to confirm. - Sikkolu Specials`,
          type: 'order_confirmation'
        }
      });
    } catch (err: any) {
      console.error('Order submission error:', err);
      toast({ title: 'Order failed: ' + (err.message || 'Unknown error'), variant: 'destructive' });
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
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <p className="text-sm font-semibold">Order Total: ₹{totalAmount}</p>
              <p className="text-xs text-gray-600">{items.length} items</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Full Name*</Label>
                <Input 
                  placeholder="Your full name" 
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})} 
                />
              </div>
              <div>
                <Label>Phone Number*</Label>
                <Input 
                  placeholder="10-digit mobile number" 
                  value={customer.phone}
                  onChange={e => setCustomer({...customer, phone: e.target.value})} 
                />
              </div>
              <div>
                <Label>Email (Optional)</Label>
                <Input 
                  type="email"
                  placeholder="your@email.com" 
                  value={customer.email}
                  onChange={e => setCustomer({...customer, email: e.target.value})} 
                />
              </div>
              <div>
                <Label>Full Shipping Address*</Label>
                <textarea 
                  className="w-full border rounded-xl p-3 h-28" 
                  placeholder="House no, Street, City, State, PIN Code" 
                  value={customer.address}
                  onChange={e => setCustomer({...customer, address: e.target.value})} 
                />
              </div>
              <Button 
                onClick={() => setStep(2)} 
                className="w-full bg-blue-600 h-14"
                disabled={!customer.name || !customer.phone || !customer.address}
              >
                Proceed to Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Back to Shop
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold">Complete Payment</h2>
            
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl">
              <p className="text-3xl font-bold text-orange-600">₹{totalAmount}</p>
              <p className="text-sm text-gray-600">Total Amount to Pay</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pay via PhonePe/GPay/Paytm UPI</h3>
              <div className="bg-white p-6 rounded-2xl border-4 border-blue-500 shadow-lg inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${settings.upi_id}&pn=SikkoluSpecials&am=${totalAmount}&cu=INR`} 
                  alt="UPI QR Code"
                  className="mx-auto"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">UPI ID</p>
                <p className="font-mono font-bold text-blue-700 text-lg">{settings.upi_id || 'Not configured'}</p>
              </div>
            </div>
            
            <div className="text-left bg-green-50 border border-green-200 p-4 rounded-xl text-sm space-y-1">
              <p className="font-bold text-green-800">OR Bank Transfer:</p>
              <p className="whitespace-pre-line text-gray-700">{settings.bank_details || 'Not configured'}</p>
            </div>

            <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-2xl relative hover:bg-blue-100 transition-colors">
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={e => setReceipt(e.target.files?.[0] || null)} 
              />
              <UploadCloud className="mx-auto text-blue-500 mb-2" size={40} />
              <p className="font-semibold text-sm">{receipt ? '✓ ' + receipt.name : 'Upload Payment Screenshot'}</p>
              <p className="text-xs text-gray-500 mt-1">Click to select image</p>
            </div>

            <Button 
              onClick={handleSubmitOrder} 
              disabled={isUploading || !receipt} 
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold"
            >
              {isUploading ? '⏳ Processing Order...' : '✓ Confirm Payment & Place Order'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep(1)} 
              className="w-full"
              disabled={isUploading}
            >
              ← Back to Details
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-10">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={64} />
            </div>
            <h2 className="text-3xl font-bold text-green-700">Order Placed Successfully!</h2>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="text-lg font-mono font-bold">#{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-left bg-blue-50 p-4 rounded-xl text-sm space-y-2">
              <p className="font-semibold">📦 What's Next?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Admin will verify your payment within 24 hours</li>
                <li>You'll receive order confirmation via SMS/Call</li>
                <li>Track your order status anytime</li>
              </ul>
              {settings.admin_phone && (
                <p className="mt-3 pt-3 border-t">📞 For queries: <strong>{settings.admin_phone}</strong></p>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/my-orders')} className="flex-1">View My Orders</Button>
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">Continue Shopping</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
