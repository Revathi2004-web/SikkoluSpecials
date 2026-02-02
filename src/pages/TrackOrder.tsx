import { useState } from 'react';
import { storage } from '@/lib/storage';
import { Search, Truck, Package, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TrackOrder() {
  const [id, setId] = useState('');
  const [order, setOrder] = useState<any>(null);

  const track = () => {
    const data = storage.getOrders().find(o => o.id === id);
    setOrder(data || 'not_found');
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="text-gray-500">Enter your order ID to see live updates</p>
      </div>

      <div className="flex gap-2 mb-10">
        <Input placeholder="Order ID" value={id} onChange={e => setId(e.target.value)} />
        <Button onClick={track}><Search className="mr-2 h-4 w-4"/> Track</Button>
      </div>

      {order === 'not_found' && <div className="text-center text-red-500">Order not found. Please check your ID.</div>}

      {order && order !== 'not_found' && (
        <div className="bg-white border rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Status: <span className="text-primary capitalize">{order.status}</span></h2>
            <Package className="text-primary h-8 w-8" />
          </div>

          {order.trackingNumber && (
            <div className="bg-gray-50 p-4 rounded-2xl mb-8 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Tracking ID</p>
                <p className="text-lg font-mono">{order.trackingNumber}</p>
              </div>
              <Truck className="text-blue-500" />
            </div>
          )}

          <div className="relative flex justify-between mt-10">
            {['pending', 'shipped', 'delivered'].map((s, i) => (
              <div key={s} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.status === s || order.status === 'delivered' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i === 0 && <Package size={18}/>}
                  {i === 1 && <Truck size={18}/>}
                  {i === 2 && <CheckCircle size={18}/>}
                </div>
                <p className="text-xs mt-2 capitalize font-bold">{s}</p>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
          </div>
        </div>
      )}
    </div>
  );
}
