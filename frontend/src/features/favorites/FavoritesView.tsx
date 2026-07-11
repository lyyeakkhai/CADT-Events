import React, { useEffect, useState } from 'react';
import { useFavoritesApi, type ApiFavorite, type ApiEvent } from '../../services/api';
import { toAcademicEvent } from '../../lib/eventMapper';
import type { AcademicEvent } from '../events/data/eventData';
import EventCard from '../../components/EventCard';
import { Heart, Loader2 } from 'lucide-react';

interface FavoritesViewProps {
  onSelectEvent: (event: AcademicEvent) => void;
  onExploreEventsClick: () => void;
}

export default function FavoritesView({ onSelectEvent, onExploreEventsClick }: FavoritesViewProps) {
  const { getMyFavorites, toggleFavorite } = useFavoritesApi();
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getMyFavorites();
      setFavorites(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(eventId);
      setFavorites((prev) => prev.filter((f) => f.eventId !== eventId));
    } catch (err) {
      console.error('Failed to remove favorite', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0b2c6a] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-[#0b2c6a] flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          My Favorites
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Events you've saved for later.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
      ) : null}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Favorites Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You haven't saved any events yet. Explore the discovery feed to find events you're interested in!
          </p>
          <button 
            onClick={onExploreEventsClick}
            className="bg-[#0b2c6a] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#082050] transition-colors"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((favorite) => {
            const academicEvent = toAcademicEvent(favorite.event);
            return (
              <div key={favorite.favoriteId} className="relative group cursor-pointer" onClick={() => onSelectEvent(academicEvent)}>
                <EventCard 
                  event={academicEvent}
                  onSelect={() => onSelectEvent(academicEvent)}
                />
                <button
                  onClick={(e) => handleRemoveFavorite(favorite.eventId, e)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
