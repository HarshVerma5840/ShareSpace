import { useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';
import { ParkingSpot } from '../data/parkingData';

interface ShareSpaceMapProps {
  spots: ParkingSpot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ShareSpaceMap({ spots, selectedId, onSelect }: ShareSpaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Decorative road abstractions for the map
  const roads = [
    { top: '35%', left: '-10%', width: '120%', height: '14px', rotate: '12deg' },
    { top: '65%', left: '-10%', width: '120%', height: '8px', rotate: '-5deg' },
    { top: '-10%', left: '45%', width: '120%', height: '20px', rotate: '82deg' },
    { top: '-10%', left: '68%', width: '120%', height: '12px', rotate: '98deg' },
    { top: '48%', left: '25%', width: '40%', height: '10px', rotate: '45deg' },
    { top: '55%', left: '50%', width: '50%', height: '6px', rotate: '-25deg' },
  ];

  const handleSpotSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelect(id);
  };

  const clearSelection = () => {
    onSelect('');
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden" onClick={clearSelection} ref={mapRef}>
      {/* Draggable Map Layer */}
      <motion.div
        drag
        dragConstraints={mapRef}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ x: -window.innerWidth * 0.5, y: -window.innerHeight * 0.5 }}
        className="absolute w-[200vw] h-[200vw] md:w-[150vw] md:h-[150vw] cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          backgroundPosition: 'center center'
        }}
      >
        {/* Abstract Roads */}
        {roads.map((road, i) => (
          <div key={i} className="absolute bg-[#1a1a1a]" style={road} />
        ))}

        {/* Spots Markers */}
        {spots.map(spot => {
          const isSelected = spot.id === selectedId;
          const isAvailable = spot.status === 'available';
          const isLimited = spot.status === 'limited';
          
          const color = isAvailable ? '#3a86ff' : isLimited ? '#ff7a00' : '#ef4444';
          const glow = isAvailable ? 'rgba(58, 134, 255, 0.4)' : isLimited ? 'rgba(255, 122, 0, 0.4)' : 'rgba(239, 68, 68, 0.4)';

          return (
            <motion.div
              key={spot.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
              style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
              onClick={(e) => handleSpotSelect(e, spot.id)}
              whileHover={{ scale: 1.1, zIndex: 20 }}
              animate={{ scale: isSelected ? 1.2 : 1, zIndex: isSelected ? 30 : 10 }}
            >
              {/* Radar pulse for selected or all? Let's just do selected to keep it clean */}
              {isSelected && (
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  style={{ backgroundColor: color }}
                  animate={{ 
                    width: ['24px', '80px'], 
                    height: ['24px', '80px'], 
                    opacity: [0.4, 0] 
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              
              {/* Marker Icon */}
              <div
                className="relative z-10 p-2.5 rounded-full shadow-lg text-white flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: color, 
                  boxShadow: isSelected ? `0 0 20px ${glow}` : `0 0 8px ${glow}`,
                  border: '1.5px solid rgba(255,255,255,0.2)'
                }}
              >
                <MapPin size={22} fill="currentColor" stroke="#fff" strokeWidth={1} />
              </div>

              {/* Marker Label */}
              <AnimatePresence>
                {(isSelected || isAvailable) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`mt-2 px-3 py-1.5 backdrop-blur-md rounded-lg text-xs font-bold whitespace-nowrap shadow-xl border border-white/5
                                ${isSelected ? 'bg-white text-black' : 'bg-[#1e1e1e]/90 text-white'}`}
                  >
                    {spot.price}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Ambient Radar / Scanning Line Overlay */}
      <motion.div
        className="absolute left-0 right-0 h-[20vh] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(58, 134, 255, 0.02) 40%, rgba(58, 134, 255, 0.08) 98%, rgba(58, 134, 255, 0.2) 100%)',
          borderBottom: '1px solid rgba(58, 134, 255, 0.3)'
        }}
        animate={{ top: ['-20%', '120%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating Action Button: Use Location */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-[65vh] right-4 md:bottom-8 md:right-8 bg-[#1e1e1e] hover:bg-[#2a2a2a] p-3.5 rounded-full shadow-2xl border border-white/10 text-[#3a86ff] transition-colors z-20 group flex items-center justify-center"
      >
        <Navigation size={22} className="group-hover:fill-[#3a86ff]/20" />
      </motion.button>
    </div>
  );
}

// Simple wrapper for framer motion's AnimatePresence which isn't imported at the top
import { AnimatePresence } from 'motion/react';
