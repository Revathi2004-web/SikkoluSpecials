import { X, ShoppingCart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { ReviewSection } from './ReviewSection';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onBuyNow: () => void;
}

export function ProductModal({ product, onClose, onBuyNow }: ProductModalProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({ 
      title: 'Added to cart! 🛒',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold">Product Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {product.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleAddToCart} variant="outline" size="lg">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button onClick={onBuyNow} size="lg">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t pt-6">
            <ReviewSection productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
