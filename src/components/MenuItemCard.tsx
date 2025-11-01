import { Plus, Minus, IndianRupee, Flame } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function MenuItemCard({ item, cartQuantity, onAdd, onIncrement, onDecrement }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 flex space-x-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {item.is_vegetarian && (
                <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              )}
              {!item.is_vegetarian && (
                <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              )}
              {item.is_bestseller && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold">
                  Bestseller
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>

            <div className="flex items-center space-x-3 mt-2">
              <div className="flex items-center text-gray-900 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{item.price}</span>
              </div>
              {item.spice_level && (
                <div className="flex items-center space-x-1 text-red-500 text-xs">
                  <Flame className="w-3 h-3" />
                  <span className="capitalize">{item.spice_level}</span>
                </div>
              )}
              {item.calories && (
                <span className="text-xs text-gray-500">{item.calories} cal</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {cartQuantity === 0 ? (
          <button
            onClick={onAdd}
            disabled={!item.is_available}
            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            {item.is_available ? 'ADD' : 'Unavailable'}
          </button>
        ) : (
          <div className="flex items-center space-x-2 bg-orange-500 text-white rounded-lg">
            <button
              onClick={onDecrement}
              className="p-1.5 hover:bg-orange-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold w-8 text-center">{cartQuantity}</span>
            <button
              onClick={onIncrement}
              className="p-1.5 hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
