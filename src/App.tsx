import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import { TrackOrder } from './pages/TrackOrder';
import { MyOrders } from './pages/MyOrders';
import Checkout from './pages/checkout'; 
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Admin Page */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Other Pages */}
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Default redirect to Home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
