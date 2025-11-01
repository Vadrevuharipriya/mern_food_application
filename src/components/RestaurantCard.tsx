import { Star, Clock, IndianRupee } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full text-left"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {!restaurant.is_open && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Currently Closed</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>

        <div className="flex items-center space-x-2 mb-2">
          {restaurant.cuisine_types.slice(0, 3).map((cuisine, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-green-600 font-semibold">
            <Star className="w-4 h-4 fill-current" />
            <span>{restaurant.rating}</span>
            <span className="text-gray-500">({restaurant.total_ratings})</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>{restaurant.delivery_time}</span>
          </div>

          <div className="flex items-center space-x-1 text-gray-700">
            <IndianRupee className="w-4 h-4" />
            <span>{restaurant.minimum_order} min</span>
          </div>
        </div>
      </div>
    </button>
  );
}
