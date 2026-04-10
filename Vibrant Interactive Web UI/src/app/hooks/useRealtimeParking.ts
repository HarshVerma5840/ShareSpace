import { useState, useEffect } from 'react';
import { initialSpots, ParkingSpot } from '../data/parkingData';

export function useRealtimeParking() {
  const [spots, setSpots] = useState<ParkingSpot[]>(initialSpots);

  useEffect(() => {
    // Simulate real-time availability changes
    const interval = setInterval(() => {
      setSpots(currentSpots =>
        currentSpots.map(spot => {
          // 20% chance to update a random spot per tick
          if (Math.random() > 0.8) {
            const change = Math.random() > 0.5 ? 1 : -1;
            const newAvailable = Math.max(0, Math.min(spot.total, spot.available + change));
            
            let newStatus = spot.status;
            if (newAvailable === 0) newStatus = 'full';
            else if (newAvailable < spot.total * 0.2) newStatus = 'limited';
            else newStatus = 'available';

            return { ...spot, available: newAvailable, status: newStatus };
          }
          return spot;
        })
      );
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  return spots;
}
