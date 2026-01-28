import { ShoppingCart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onBuyNow, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({ 
      title: 'Added to cart! 🛒',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer"
      onClick={() => onViewDetails?.(product)}
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.rating && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col">
        <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">{product.description}</p>
        
        {/* Price */}
        <div className="mb-3">
          <span className="text-lg md:text-xl font-bold text-primary">₹{product.price}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }} 
            className="w-full text-xs md:text-sm"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Add
          </Button>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }} 
            className="w-full text-xs md:text-sm"
          >
            <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Buy
          </Button>
        </div>
      </div>
    </div>
  );
}
