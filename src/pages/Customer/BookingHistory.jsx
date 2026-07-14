import React, { useState, useEffect } from 'react';
import { apiRequest } from "../../utils/api";
import { formatCurrency } from "../../utils/helpers";
import ListItem from "../../components/ui/ListItem";
import useAuthStore from "../../stores/authStore";

export default function BookingHistory() {
  const session = useAuthStore(s => s.session);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!session) return;
    apiRequest(`/bookings/guest/${session.user.id}`)
      .then(b => setBookings(b))
      .catch(e => console.error(e));
  }, [session]);

  return (
    <div className="p-5 pb-28 sm:p-8 md:pb-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
      <p className="text-gray-400 mt-2 mb-8">{bookings.length} confirmed sessions</p>
      <div className="bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-3">
        {bookings.length ? bookings.map((b) => (
          <ListItem key={b.id}>
            <div>
              <strong className="text-white block font-semibold">{b.spotTitle}</strong>
              <span className="text-sm text-gray-400 mt-0.5 block">Hosted by {b.hostName}</span>
              <span className="text-xs text-gray-500 mt-1 block">
                Base {formatCurrency(b.baseAmount ?? b.totalAmount)} · Fee {formatCurrency(b.platformFeeAmount ?? 0)} · Discount {formatCurrency(b.discountAmount ?? 0)}
              </span>
            </div>
            <div className="text-[#3a86ff] font-bold bg-[#3a86ff]/10 px-3 py-1.5 rounded-lg border border-[#3a86ff]/20">{formatCurrency(b.totalAmount)}</div>
          </ListItem>
        )) : <p className="text-center py-10 text-gray-500 font-medium text-sm">No bookings yet. Find and book a spot from the map.</p>}
      </div>
    </div>
  );
}
