import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { ProductModal } from '@/components/features/ProductModal';
import { Product } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFromSupabase() {
      setLoading(true);
      // Database nundi data testhunnam
      const { data, error } = await supabase.from('products').select('*');
      
      if (!error && data) {
        // Category column database lo unte idhi pani chestundi, lekapothe motham data chupisthundi
        const filtered = selectedCategory === 'all' 
          ? data 
          : data.filter(p => p.category === selectedCategory);
        setProducts(filtered);
      } else {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    }
    fetchFromSupabase();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <div className="bg-slate-900 text-white py-16 text-center shadow-lg">
        <h1 className="text-5xl font-black tracking-tight">Sikkolu Specials</h1>
        <p className="mt-4 text-slate-300 text-lg">Authentic Srikakulam Treasures Delivered to Your Home</p>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {products.length > 0 ? (
              products.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  // Ikkada ProductCard props match avvali
                  onAddToCart={() => setSelectedProduct(p)} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-400">
                No products found in this category.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Forms */}
      {viewingProduct && (
        <ProductModal 
          product={viewingProduct} 
          onClose={() => setViewingProduct(null)} 
          onBuyNow={setSelectedProduct} 
        />
      )}
      
      {selectedProduct && (
        <OrderForm 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
