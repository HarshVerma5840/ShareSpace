export type ParkingStatus = 'available' | 'limited' | 'full';

export interface ParkingSpot {
  id: string;
  name: string;
  price: string;
  distance: string;
  available: number;
  total: number;
  x: number; // percentage in the map container (0-100)
  y: number; // percentage in the map container (0-100)
  status: ParkingStatus;
  type: 'Covered' | 'Open' | 'Underground';
}

export const initialSpots: ParkingSpot[] = [
  { id: '1', name: 'Connaught Place Block A', price: '₹50/hr', distance: '0.2 km', available: 45, total: 150, x: 48, y: 52, status: 'available', type: 'Open' },
  { id: '2', name: 'Palika Bazaar Underground', price: '₹40/hr', distance: '0.5 km', available: 12, total: 200, x: 50, y: 48, status: 'limited', type: 'Underground' },
  { id: '3', name: 'Khan Market Premium', price: '₹100/hr', distance: '2.1 km', available: 0, total: 50, x: 55, y: 45, status: 'full', type: 'Covered' },
  { id: '4', name: 'Shivaji Stadium', price: '₹60/hr', distance: '1.2 km', available: 89, total: 120, x: 45, y: 58, status: 'available', type: 'Open' },
  { id: '5', name: 'Cyber Hub Parking', price: '₹80/hr', distance: '5.8 km', available: 5, total: 300, x: 62, y: 64, status: 'limited', type: 'Underground' },
  { id: '6', name: 'DLF Mall Multi-level', price: '₹120/hr', distance: '4.5 km', available: 20, total: 400, x: 58, y: 59, status: 'available', type: 'Covered' },
  { id: '7', name: 'South Ex Valet', price: '₹150/hr', distance: '3.0 km', available: 2, total: 40, x: 53, y: 49, status: 'limited', type: 'Covered' },
];
