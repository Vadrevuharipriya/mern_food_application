import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Clock, IndianRupee, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Restaurant, MenuItem, Category } from '../types';
import { MenuItemCard } from '../components/MenuItemCard';
import { useCart } from '../contexts/CartContext';

interface RestaurantPageProps {
  restaurantId: string;
  onBackClick: () => void;
}

export function RestaurantPage({ restaurantId, onBackClick }: RestaurantPageProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateCartItem } = useCart();

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('name');

      if (menuError) throw menuError;
      setMenuItems(menuData || []);

      const uniqueCategories = Array.from(
        new Map(
          menuData
            .map((item: any) => item.category)
            .filter(Boolean)
            .map((cat: Category) => [cat.id, cat])
        ).values()
      );
      setCategories(uniqueCategories as Category[]);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartItemQuantity = (menuItemId: string) => {
    const cartItem = cart?.items.find((item) => item.menu_item_id === menuItemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    await addToCart(restaurantId, menuItem, 1);
  };

  const handleIncrement = async (menuItem: MenuItem) => {
    const cartItem = cart?.items.find((item) => item.menu_item_id === menuItem.id);
    if (cartItem) {
      await updateCartItem(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = async (menuItem: MenuItem) => {
    const cartItem = cart?.items.find((item) => item.menu_item_id === menuItem.id);
    if (cartItem) {
      await updateCartItem(cartItem.id, cartItem.quantity - 1);
    }
  };

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item) => item.category_id === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative">
        <img
          src={restaurant.banner_url}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={onBackClick}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-4">{restaurant.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.cuisine_types.map((cuisine, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {cuisine}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-green-600 fill-current" />
              <div>
                <div className="font-semibold text-gray-900">{restaurant.rating}</div>
                <div className="text-xs text-gray-500">{restaurant.total_ratings} ratings</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">{restaurant.delivery_time}</div>
                <div className="text-xs text-gray-500">Delivery time</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">₹{restaurant.minimum_order}</div>
                <div className="text-xs text-gray-500">Min order</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">{restaurant.city}</div>
                <div className="text-xs text-gray-500">Location</div>
              </div>
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 overflow-x-auto">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
          <div className="space-y-4">
            {filteredMenuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                cartQuantity={getCartItemQuantity(item.id)}
                onAdd={() => handleAddToCart(item)}
                onIncrement={() => handleIncrement(item)}
                onDecrement={() => handleDecrement(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
