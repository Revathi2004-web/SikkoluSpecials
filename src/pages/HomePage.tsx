import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/features/ProductCard';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { OrderForm } from '@/components/forms/OrderForm';
import { ProductModal } from '@/components/features/ProductModal';
import { storage } from '@/lib/storage';
import { Product } from '@/types';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
    
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = () => {
      loadProducts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Aggressive polling for real-time sync (works on published sites)
    const interval = setInterval(loadProducts, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCategory]);

  const loadProducts = () => {
    // CRITICAL FIX: Only show published products to users
    const allProducts = storage.getPublishedProducts();
    const filtered = selectedCategory === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === selectedCategory);
    setProducts(filtered);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/90 to-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Authentic Srikakulam Products
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-95">
              Discover the finest traditional snacks, sweets, handicrafts, and local specialties from the heart of Srikakulam
            </p>
            <div className="flex gap-3 text-sm flex-wrap">
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">✓ 100% Authentic</div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">✓ Local Artisans</div>
              <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg">✓ Fast Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </h2>
          <span className="text-muted-foreground">{products.length} products</span>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No products available at the moment.</p>
            <p className="text-sm mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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

      {/* Product Details Modal */}
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

      {/* Order Form Modal */}
      {selectedProduct && (
        <OrderForm
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
