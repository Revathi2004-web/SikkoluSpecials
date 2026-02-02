import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { Product } from '@/types';
import { ShoppingBag, Search } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. Fetch Products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase()));
    }
  }, [selectedCategory, products]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SIKKOLU <span className="text-orange-500">SPECIALS</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Search size={20} /></button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <button className="text-sm font-medium text-slate-600 hover:text-orange-500">Admin</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4">Srikakulam's Finest <br/><span className="text-orange-500">Traditional Treasures</span></h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Discover authentic hand-picked specials from the heart of Andhra Pradesh, delivered straight to your doorstep.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <p className="text-slate-500 text-sm font-medium">{filteredProducts.length} Items Found</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onBuyNow={() => setSelectedProduct(p)} 
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-medium text-lg">No products found in this category.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Form Modal */}
      {selectedProduct && (
        <OrderForm 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Sikkolu Specials. Made with ❤️ for Srikakulam.</p>
      </footer>
    </div>
  );
}
