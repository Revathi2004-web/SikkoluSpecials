import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index'; // నీ అసలు ఫీచర్స్ అన్నీ ఇందులో ఉన్నాయి
import AdminDashboard from './pages/AdminDashboard';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import Checkout from './pages/checkout'; 
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* హోమ్ పేజీలో నీ పాత డిజైన్ రావాలంటే Index వాడాలి */}
        <Route path="/" element={<Index />} />
        
        {/* అడ్మిన్ పేజీ */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* మిగిలిన పేజీలు */}
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {/* ఏ పేజీ లేకపోయినా హోమ్ కి వెళ్తుంది */}
        <Route path="*" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
