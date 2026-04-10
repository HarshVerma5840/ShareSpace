import { useState } from 'react';
import ShareSpaceMap from './components/ShareSpaceMap';
import ParkingPanel from './components/ParkingPanel';
import { useRealtimeParking } from './hooks/useRealtimeParking';
import { Search, Car } from 'lucide-react';

export default function App() {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const spots = useRealtimeParking();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-[#3a86ff]/30 selection:text-[#3a86ff]">
      {/* Interactive Map Layer */}
      <ShareSpaceMap
        spots={spots}
        selectedId={selectedSpotId}
        onSelect={setSelectedSpotId}
      />

      {/* UI Overlay Layer */}
      <div className="pointer-events-none absolute inset-0 z-20">
        
        {/* Floating Top Header & Search Bar */}
        <div className="pointer-events-auto absolute top-4 left-4 right-4 md:top-6 md:left-6 md:w-[420px] flex flex-col gap-4">
            {/* App Brand */}
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-xl pl-1">
                <Car className="text-[#ff7a00]" size={28} /> ShareSpace
            </h1>
            
            {/* Search Input */}
            <div className="relative group shadow-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3a86ff] transition-colors" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search location in India..."
                    className="w-full bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#3a86ff] focus:ring-1 focus:ring-[#3a86ff] transition-all"
                />
            </div>
        </div>

        {/* Floating List Panel */}
        <ParkingPanel
          spots={spots}
          selectedId={selectedSpotId}
          onSelect={setSelectedSpotId}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
