import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; 
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { Product } from '@/types';
import { ShoppingBag, LogIn, LogOut, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

export function HomePage() {
  const navigate = useNavigate();
  const { items, getTotalItems } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer');
    setCustomer(null);
    navigate('/');
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase()));
    }
  }, [selectedCategory, products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Top Nav - Maroon & Gold Theme */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#800000] to-[#600000] text-white shadow-2xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37] p-3 rounded-xl shadow-lg">
              <ShoppingBag className="text-[#800000]" size={24} />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-wide">SIKKOLU</span>
              <span className="text-xl font-light text-[#D4AF37] ml-2">SPECIALS</span>
              <p className="text-xs text-slate-200 tracking-widest">SRIKAKULAM TREASURES</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {customer ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/my-orders')} 
                  className="text-white hover:bg-[#D4AF37] hover:text-[#800000] transition-all"
                >
                  <Package className="w-5 h-5 mr-2" /> My Orders
                </Button>
                <div className="hidden md:block text-sm font-medium text-[#D4AF37]">
                  Welcome, {customer.name}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#800000]"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/register')} 
                  className="text-white hover:bg-[#D4AF37] hover:text-[#800000] transition-all"
                >
                  Register
                </Button>
                <Button 
                  onClick={() => navigate('/login')} 
                  className="bg-[#D4AF37] text-[#800000] hover:bg-[#F5D576] font-bold"
                >
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </Button>
              </>
            )}
            <Button 
              onClick={() => navigate('/checkout')} 
              className="bg-white text-[#800000] hover:bg-[#D4AF37] relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Luxury Design */}
      <header className="bg-gradient-to-r from-[#800000] via-[#600000] to-[#400000] text-white py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0Q0QUYzNyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl">
            Authentic <span className="text-[#D4AF37] italic">Luxury</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed">
            Handpicked treasures from Srikakulam's finest artisans
          </p>
          <div className="mt-8 w-32 h-1 bg-[#D4AF37] mx-auto"></div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto text-slate-300 mb-4" />
            <p className="text-2xl font-semibold text-slate-600">No products available</p>
            <p className="text-slate-500 mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onBuyNow={() => setSelectedProduct(p)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#800000] text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-[#D4AF37] p-2 rounded-lg">
              <ShoppingBag className="text-[#800000]" size={20} />
            </div>
            <span className="text-xl font-bold">SIKKOLU <span className="text-[#D4AF37]">SPECIALS</span></span>
          </div>
          <p className="text-slate-300 text-sm">© 2024 Sikkolu Specials. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-2">Authentic Srikakulam Products • Quality Guaranteed</p>
        </div>
      </footer>

      {selectedProduct && (
        <OrderForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
