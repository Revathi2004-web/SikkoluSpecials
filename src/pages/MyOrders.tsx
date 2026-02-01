import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function MyOrders() {
  const { currentUser } = useAuthStore();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadOrders();
      const interval = setInterval(loadOrders, 2000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadOrders = () => {
    if (currentUser) {
      const userOrders = storage.getUserOrders(currentUser.id);
      setOrders(userOrders.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      ));
    }
  };

  const handleCancelOrder = (order: Order) => {
    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') {
      toast({ 
        title: 'Cannot cancel order', 
        description: 'This order cannot be cancelled at this stage.',
        variant: 'destructive' 
      });
      return;
    }
    setSelectedOrder(order);
  };

  const confirmCancellation = () => {
    if (!selectedOrder || !cancellationReason.trim()) {
      toast({ title: 'Please provide a cancellation reason', variant: 'destructive' });
      return;
    }

    storage.updateOrder(selectedOrder.id, {
      status: 'cancelled',
      cancellationReason: cancellationReason.trim(),
    });

    toast({ 
      title: 'Order Cancelled', 
      description: 'Your order has been cancelled successfully.' 
    });

    setSelectedOrder(null);
    setCancellationReason('');
    loadOrders();
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-muted-foreground">Login to view your orders</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b flex flex-wrap gap-4 justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Order #{order.id}</span>
                  <span className="text-muted-foreground ml-4">
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus === 'completed' ? 'PAID' : 'PENDING PAYMENT'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Quantity: {order.quantity}</p>
                    <p className="text-2xl font-bold text-primary">₹{order.productPrice * order.quantity}</p>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Order Tracking
                  </h4>
                  <div className="flex items-center justify-between">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status, index) => {
                      const isActive = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;
                      const isCurrent = order.status === status;
                      return (
                        <div key={status} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                            {getStatusIcon(status as Order['status'])}
                          </div>
                          <p className={`text-xs mt-1 capitalize ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                            {status}
                          </p>
                          {index < 4 && (
                            <div className={`h-1 w-full ${isActive ? 'bg-primary' : 'bg-gray-200'} absolute top-4 left-1/2 -z-10`} style={{ width: '100%' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Tracking Number: <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  </div>
                )}

                {order.paymentDate && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Payment Received: {new Date(order.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {order.cancellationReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-sm font-medium mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-muted-foreground">{order.cancellationReason}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="font-medium mb-1">Delivery Address:</p>
                    <p className="text-muted-foreground">
                      {order.address}<br />
                      {order.city}, {order.state} - {order.pincode}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact:
                    </p>
                    <p className="text-muted-foreground">{order.phone}</p>
                    {order.email && <p className="text-muted-foreground">{order.email}</p>}
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-4">
                    <p className="font-medium text-sm mb-1">Special Instructions:</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelOrder(order)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for cancelling this order:
            </p>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Ordered by mistake, Found better price elsewhere..."
              rows={4}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={confirmCancellation} variant="destructive" className="flex-1">
                Confirm Cancellation
              </Button>
              <Button onClick={() => setSelectedOrder(null)} variant="outline" className="flex-1">
                Keep Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
