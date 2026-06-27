import { create } from 'zustand';

const useDashboardStore = create((set) => ({
  page: "map", // default page
  wallet: null,
  spots: [],
  bookings: [],
  selectedSpot: null,
  selectedPoint: null,
  
  setPage: (page) => set({ page }),
  setWallet: (wallet) => set({ wallet }),
  setSpots: (spots) => set({ spots }),
  setBookings: (bookings) => set({ bookings }),
  setSelectedSpot: (spot) => set({ selectedSpot: spot }),
  setSelectedPoint: (point) => set({ selectedPoint: point }),
}));

export default useDashboardStore;
