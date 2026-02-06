import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import { TrackOrder } from './pages/TrackOrder';
import { MyOrders } from './pages/MyOrders';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Checkout from './pages/checkout'; 
import { Toaster } from '@/components/ui/toaster';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Page */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Customer Pages */}
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Other Pages */}
        <Route path="/track-order" element={<TrackOrder />} />
        
        {/* Default redirect to Home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
