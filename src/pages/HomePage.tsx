import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Product } from '@/types';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductModal } from '@/components/features/ProductModal';
import { ChatBot } from '@/components/features/ChatBot';
import { CategoryFilter } from '@/components/layout/CategoryFilter';
import { useCartStore } from '@/stores/cartStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function HomePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const lastProductsRef = useRef<Product[]>([]);
  const { addItem, items } = useCartStore();

  // Real-time polling for admin product updates
  useEffect(() => {
    const loadProducts = () => {
      const publishedProducts = storage.getPublishedProducts();
      
      // Compare with previous products to detect changes
      if (JSON.stringify(publishedProducts) !== JSON.stringify(lastProductsRef.current)) {
        setProducts(publishedProducts);
        lastProductsRef.current = publishedProducts;
      }
    };

    loadProducts();
    const interval = setInterval(loadProducts, 1500);

    // Listen for storage events from other tabs/windows
    const handleStorageChange = () => loadProducts();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = (product: Product) => {
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Sikkolu Specials
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Authentic Products from Srikakulam
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search for traditional products, handicrafts, spices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/95 backdrop-blur border-none shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shopping Cart Badge */}
      {items.length > 0 && (
        <button
          onClick={() => navigate('/checkout')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all z-50"
        >
          <ShoppingBag size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {items.length}
          </span>
        </button>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* AI ChatBot */}
      <ChatBot />
    </div>
  );
}
