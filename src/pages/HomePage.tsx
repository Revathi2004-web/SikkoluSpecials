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
      const { data, error } = await supabase.from('products').select('*');
      if (!error) {
        const filtered = selectedCategory === 'all' 
          ? data 
          : data.filter(p => p.category === selectedCategory);
        setProducts(filtered || []);
      }
      setLoading(false);
    }
    fetchFromSupabase();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-primary text-primary-foreground py-16 text-center">
        <h1 className="text-4xl font-bold">Sikkolu Specials</h1>
        <p className="mt-2 text-lg">Discovery traditional Srikakulam treasures</p>
      </div>
      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <div className="container mx-auto px-4 mt-8">
        {loading ? ( <div className="text-center py-10">Loading...</div> ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onBuyNow={setSelectedProduct} onViewDetails={setViewingProduct} />
            ))}
          </div>
        )}
      </div>
      {viewingProduct && <ProductModal product={viewingProduct} onClose={() => setViewingProduct(null)} onBuyNow={setSelectedProduct} />}
      {selectedProduct && <OrderForm product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
