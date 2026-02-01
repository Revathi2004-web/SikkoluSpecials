import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { ProductModal } from '@/components/features/ProductModal';
import { Product } from '@/types';
import { supabase } from '@/lib/supabaseClient'; // పైన మనం క్రియేట్ చేసిన ఫైల్ లింక్

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupabaseProducts();
  }, [selectedCategory]);

  const loadSupabaseProducts = async () => {
    setLoading(true);
    try {
      // సుపాబేస్ నుండి డేటా ఫెచ్ చేయడం
      let query = supabase.from('products').select('*');
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sikkolu Specials</h1>
          <p className="text-xl opacity-90">Srikakulam's Traditional Treasures Delivered to You.</p>
        </div>
      </div>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold capitalize">{selectedCategory} Products</h2>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">{products.length} Items</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found. Add some in Supabase!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNow={setSelectedProduct}
                onViewDetails={setViewingProduct}
              />
            ))}
          </div>
        )}
      </div>

      {viewingProduct && (
        <ProductModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onBuyNow={() => {
            setSelectedProduct(viewingProduct);
            setViewingProduct(null);
          }}
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
