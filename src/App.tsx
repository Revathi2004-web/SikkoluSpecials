import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard'; // src/pages lo ee file undali
import CheckoutPage from './pages/CheckoutPage'; // Oka vela unte

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={<HomePage />} />
        
        {/* Admin Page Route */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Checkout Page Route (Optional) */}
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* 404 handling - Page lekapothe Home ki velthundi */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
