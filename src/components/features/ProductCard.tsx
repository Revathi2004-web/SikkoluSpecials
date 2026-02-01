import { ShoppingCart, ShoppingBag, Star, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
      onClick={() => onViewDetails?.(product)}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1">
            {discount}% OFF
          </Badge>
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-square overflow-hidden relative bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {product.rating && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 md:p-4">
        {/* Category Tag */}
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        
        {/* Pricing Section - Amazon Style */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs text-muted-foreground">₹</span>
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
                <span className="text-sm font-semibold text-red-600">({discount}% off)</span>
              </>
            )}
          </div>
          {product.mrp && product.mrp > product.price && (
            <p className="text-xs text-green-700 font-medium">
              You save ₹{product.mrp - product.price}!
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }} 
            className="w-full text-xs md:text-sm border-2 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Add to Cart
          </Button>
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }} 
            className="w-full text-xs md:text-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md"
          >
            <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Buy Now
          </Button>
        </div>

        {/* Free Delivery Badge */}
        <div className="mt-2 text-center">
          <span className="text-xs text-green-700 font-medium">
            ✓ Free Delivery Available
          </span>
        </div>
      </div>
    </div>
  );
}
