import { useState, useEffect, useRef } from 'react';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { ProductModal } from '@/components/features/ProductModal';
import { Product } from '@/types';
import { storage } from '@/lib/storage';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const previousProductsRef = useRef<string>('');

  // Load products initially and filter by category
  useEffect(() => {
    const allProducts = storage.getPublishedProducts();
    const filtered = selectedCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === selectedCategory);
    setProducts(filtered);
  }, [selectedCategory]);

  // Real-time sync: Poll for product changes every 1.5 seconds
  useEffect(() => {
    const checkForUpdates = () => {
      const currentProducts = storage.getPublishedProducts();
      const currentSnapshot = JSON.stringify(currentProducts);
      
      if (previousProductsRef.current !== currentSnapshot) {
        previousProductsRef.current = currentSnapshot;
        const filtered = selectedCategory === 'all' 
          ? currentProducts 
          : currentProducts.filter(p => p.category === selectedCategory);
        setProducts(filtered);
      }
    };

    const interval = setInterval(checkForUpdates, 1500);
    checkForUpdates();

    return () => clearInterval(interval);
  }, [selectedCategory]);

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
        
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products available in this category</p>
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
