import { useState, useEffect, useRef } from 'react';
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
  const [products, setProducts] = useState<Product[]>(storage.getProducts());

  // Real-time sync: Refresh products to sync with admin changes (works for published sites too)
  const productsRef = useRef<Product[]>(products);
  
  useEffect(() => {
    productsRef.current = products;
  }, [products]);
  
  useEffect(() => {
    // Immediate load
    setProducts(storage.getProducts());
    
    // Poll for changes every 1.5 seconds for real-time updates
    const interval = setInterval(() => {
      const updatedProducts = storage.getProducts();
      // Only update if products have actually changed
      if (JSON.stringify(updatedProducts) !== JSON.stringify(productsRef.current)) {
        setProducts(updatedProducts);
        console.log('✅ Products synced from admin changes');
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - run once on mount

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

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
            <div className="flex gap-3 text-sm">
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
          <span className="text-muted-foreground">{filteredProducts.length} products</span>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No products found in this category
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
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
