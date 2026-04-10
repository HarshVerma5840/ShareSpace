import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation2, ShieldAlert } from 'lucide-react';
import { ParkingSpot } from '../data/parkingData';

interface ParkingPanelProps {
  spots: ParkingSpot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
}

export default function ParkingPanel({ spots, selectedId, onSelect, searchQuery }: ParkingPanelProps) {
  const [filter, setFilter] = useState('All');
  
  const filters = ['All', 'Available', 'Cheapest', 'Nearest', 'Covered'];

  const filteredSpots = spots
    .filter(spot => {
      if (searchQuery && !spot.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      if (filter === 'Available') return spot.status !== 'full';
      if (filter === 'Covered') return spot.type === 'Covered' || spot.type === 'Underground';
      
      return true;
    })
    .sort((a, b) => {
      if (filter === 'Cheapest') {
        const priceA = parseInt(a.price.replace(/\D/g, ''));
        const priceB = parseInt(b.price.replace(/\D/g, ''));
        return priceA - priceB;
      }
      if (filter === 'Nearest') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return 0;
    });

  return (
    <div className="pointer-events-auto absolute z-10 flex flex-col bg-[#121212]/95 backdrop-blur-2xl border-t md:border border-white/10 shadow-2xl transition-all duration-300
                    md:top-[164px] md:left-6 md:bottom-6 md:w-[420px] md:rounded-2xl
                    top-auto bottom-0 left-0 right-0 h-[50vh] md:h-auto rounded-t-3xl overflow-hidden">
        
      {/* Mobile Handle & Filters */}
      <div className="px-5 pt-4 pb-3 md:pt-5 border-b border-white/5 shrink-0 bg-gradient-to-b from-[#1a1a1a]/50 to-transparent">
        <div className="w-12 h-1.5 bg-[#2a2a2a] rounded-full mx-auto mb-4 md:hidden" />
        
        <div className="flex justify-between items-center mb-1">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearby Parking</h2>
           <span className="text-xs text-gray-500 font-medium bg-[#1e1e1e] px-2 py-1 rounded-md border border-white/5">
              {filteredSpots.length} found
           </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-2 px-2 mask-linear">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border 
                          ${filter === f 
                            ? 'bg-[#3a86ff] text-white border-[#3a86ff] shadow-[0_0_12px_rgba(58,134,255,0.4)]' 
                            : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:bg-[#222] hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 pb-8 md:pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="popLayout">
          {filteredSpots.map(spot => {
            const isSelected = spot.id === selectedId;
            const isAvailable = spot.status === 'available';
            const isLimited = spot.status === 'limited';

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                key={spot.id}
                onClick={() => onSelect(spot.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border relative overflow-hidden group
                            ${isSelected 
                              ? 'bg-[#1e1e1e] border-[#3a86ff] shadow-[0_0_15px_rgba(58,134,255,0.08)]' 
                              : 'bg-[#161616] border-white/5 hover:border-white/20'}`}
              >
                {/* Selection indicator line */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#3a86ff]" 
                  />
                )}

                <div className="flex justify-between items-start mb-1.5 pl-1.5">
                  <div className="pr-4">
                    <h3 className="font-semibold text-white text-[15px] leading-tight">{spot.name}</h3>
                    <p className="text-[13px] text-gray-400 flex items-center gap-1.5 mt-1.5 font-medium">
                      <MapPin size={13} className="text-gray-500" /> {spot.distance} 
                      <span className="text-gray-600">•</span> {spot.type}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-white text-[15px] bg-[#222] px-2.5 py-1 rounded-md border border-white/5 shadow-inner">
                      {spot.price}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pl-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-sm 
                                    ${isAvailable ? 'bg-[#3a86ff] shadow-[#3a86ff]/50' : 
                                      isLimited ? 'bg-[#ff7a00] shadow-[#ff7a00]/50' : 
                                      'bg-red-500 shadow-red-500/50'}`} 
                    />
                    <span className={`text-[13px] font-semibold tracking-wide 
                                      ${isAvailable ? 'text-[#3a86ff]' : 
                                        isLimited ? 'text-[#ff7a00]' : 
                                        'text-red-500'}`}>
                      {spot.status === 'full' ? 'Parking Full' : `${spot.available} slots left`}
                    </span>
                  </div>
                  
                  {isSelected && spot.status !== 'full' && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#ff7a00] hover:bg-[#e66e00] text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-[#ff7a00]/20 flex items-center gap-1.5"
                    >
                      <Navigation2 size={14} fill="currentColor" />
                      Navigate
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {filteredSpots.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <ShieldAlert className="text-gray-600" size={24} />
              </div>
              <p className="text-gray-300 font-medium">No parking spots found.</p>
              <p className="text-sm text-gray-500 mt-1">Try changing your search or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
