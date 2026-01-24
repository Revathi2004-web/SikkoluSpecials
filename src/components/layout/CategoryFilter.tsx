import { CATEGORIES } from '@/constants/categories';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-6 mb-8">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-white hover:bg-primary/10'
            }`}
          >
            <span className="text-2xl mb-1">🛍️</span>
            <span className="text-xs font-medium">All</span>
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-white hover:bg-primary/10'
              }`}
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
