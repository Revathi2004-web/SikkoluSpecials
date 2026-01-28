import { useState, useEffect } from 'react';
import { X, QrCode, Building2 } from 'lucide-react';
import { ContactNumbers } from '@/components/features/ContactNumbers';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product, Order, PaymentInfo } from '@/types';
import { CartItem } from '@/stores/cartStore';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  product?: Product;
  cartItems?: CartItem[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function OrderForm({ product, cartItems, onClose, onSuccess }: OrderFormProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentInfo[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  useEffect(() => {
    const methods = storage.getPaymentInfo().filter(p => p.isActive);
    setPaymentMethods(methods);
    if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0].id);
    }
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    quantity: 1,
    notes: '',
  });

  const selectedPayment = paymentMethods.find(p => p.id === selectedPaymentMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPaymentMethod) {
      toast({ title: 'Please select a payment method', variant: 'destructive' });
      return;
    }
    
    // Handle cart checkout (multiple items)
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item, index) => {
        const order: Order = {
          id: (Date.now() + index).toString(),
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          customerName: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          quantity: item.quantity,
          notes: formData.notes,
          orderDate: new Date().toISOString(),
          status: 'pending',
        };
        storage.addOrder(order);
      });
      
      toast({
        title: `${cartItems.length} Orders Placed Successfully! 🎉`,
        description: 'Admin will contact you soon for confirmation.',
      });
    } 
    // Handle single product order
    else if (product) {
      const order: Order = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        ...formData,
        orderDate: new Date().toISOString(),
        status: 'pending',
      };
      storage.addOrder(order);
      
      toast({
        title: 'Order Placed Successfully! 🎉',
        description: 'Admin will contact you soon for confirmation.',
      });
    }
    
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Complete Your Order</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <ContactNumbers />

          {/* Payment Method Selection */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Select Payment Method
            </h3>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.type === 'upi' ? '💳 UPI Payment' : '🏦 Bank Transfer'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show payment details */}
            {selectedPayment && (
              <div className="mt-4 p-4 bg-white rounded border">
                {selectedPayment.type === 'upi' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <QrCode className="w-4 h-4" />
                      UPI Payment Details
                    </div>
                    <div className="text-center">
                      {selectedPayment.qrCode && (
                        <img 
                          src={selectedPayment.qrCode} 
                          alt="UPI QR Code" 
                          className="w-48 h-48 mx-auto border rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm">UPI ID: <strong>{selectedPayment.upiId}</strong></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scan QR code or use UPI ID for payment
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <Building2 className="w-4 h-4" />
                      Bank Transfer Details
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Bank Name:</span>
                      <span className="font-medium">{selectedPayment.bankName}</span>
                      <span className="text-muted-foreground">Account Number:</span>
                      <span className="font-medium">{selectedPayment.accountNumber}</span>
                      <span className="text-muted-foreground">IFSC Code:</span>
                      <span className="font-medium">{selectedPayment.ifscCode}</span>
                      <span className="text-muted-foreground">Account Holder:</span>
                      <span className="font-medium">{selectedPayment.accountHolder}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          {cartItems && cartItems.length > 0 ? (
            <div className="bg-primary/5 p-4 rounded-lg my-6 space-y-3">
              <h3 className="font-semibold text-lg mb-3">Order Summary ({cartItems.length} items)</h3>
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 pb-3 border-b last:border-0">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">₹{item.product.price} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-primary">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
          ) : product ? (
            <div className="bg-primary/5 p-4 rounded-lg my-6 flex gap-4">
              <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{product.description}</p>
                <span className="text-lg font-bold text-primary">₹{product.price}</span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Only show quantity field for single product orders */}
            {!cartItems && product && (
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Any special requests or instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              {cartItems && cartItems.length > 0 ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Items:</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">
                      ₹{cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                    </span>
                  </div>
                </>
              ) : product ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Price per item:</span>
                    <span>₹{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quantity:</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{product.price * formData.quantity}</span>
                  </div>
                </>
              ) : null}
            </div>

            <Button type="submit" className="w-full" size="lg">
              Place Order
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
