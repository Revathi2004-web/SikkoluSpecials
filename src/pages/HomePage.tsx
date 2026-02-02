import { useState, useEffect } from 'react';
// PATH FIX: Make sure this matches your file name
import { supabase } from '@/lib/supabaseClient'; 
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { Product } from '@/types';
import { ShoppingBag, Search } from 'lucide-react';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        console.log("Fetching data from Supabase...");
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log("Data received:", data);
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Mawa, Supabase connection error:", err);
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-200">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900">SIKKOLU <span className="text-orange-600">SPECIALS</span></span>
          </div>
          <div className="flex items-center gap-6">
             <button className="text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors">Admin Dashboard</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-slate-900 text-white py-24 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Srikakulam's <span className="text-orange-500 underline decoration-wavy underline-offset-8">Best</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">Authentic, hand-picked treasures from our local artisans.</p>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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

      {selectedProduct && (
        <OrderForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
