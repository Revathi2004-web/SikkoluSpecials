import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TrackOrder } from './pages/TrackOrder';
import { MyOrders } from './pages/MyOrders';
import CheckoutPage from './pages/checkout';
import { LoginPortal } from './pages/LoginPortal';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPortal onUserLogin={() => {}} onAdminLogin={() => {}} />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
