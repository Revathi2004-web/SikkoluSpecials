import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  image_url?: string; // Fallback kosam
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Database lo 'image' leda 'image_url' denlo data unna tiskuntundi
  const productImage = product.image || product.image_url || 'https://via.placeholder.com/300?text=No+Image';

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Product Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300?text=Sikkolu+Specials';
          }}
        />
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
            <Eye size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
          {product.description || "Fresh and authentic Srikakulam special product."}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-black text-blue-600">
              ₹{product.price}
            </span>
            {product.price === 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                Contact for Price
              </span>
            )}
          </div>

          <Button 
            onClick={() => onAddToCart?.(product)}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
