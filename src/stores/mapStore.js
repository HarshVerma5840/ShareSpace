import { create } from 'zustand';

const useMapStore = create((set) => ({
  currentLocation: null,
  destinationPoint: null,
  searchRadiusKm: "1",
  directions: null,
  routeMeta: null,
  landmarkFocusPoint: null,
  
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  setDestinationPoint: (pt) => set({ destinationPoint: pt }),
  setSearchRadiusKm: (radius) => set({ searchRadiusKm: radius }),
  setDirections: (dirs) => set({ directions: dirs }),
  setRouteMeta: (meta) => set({ routeMeta: meta }),
  setLandmarkFocusPoint: (pt) => set({ landmarkFocusPoint: pt }),
}));

export default useMapStore;
