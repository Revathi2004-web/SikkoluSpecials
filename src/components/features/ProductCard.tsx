import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
}

export function ProductCard({ product, onBuyNow }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <Button size="sm" onClick={() => onBuyNow(product)} className="gap-1">
            <ShoppingCart className="w-4 h-4" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
