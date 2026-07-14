import React, { useState, useEffect } from 'react';
import { apiRequest } from "../../utils/api";
import WalletCard from "../../components/ui/WalletCard";
import useAuthStore from "../../stores/authStore";
import useDashboardStore from "../../stores/dashboardStore";

export default function Wallet() {
  const session = useAuthStore(s => s.session);
  const wallet = useDashboardStore(s => s.wallet);
  const setWallet = useDashboardStore(s => s.setWallet);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!session) return;
    apiRequest(`/wallets/${session.user.id}`)
      .then(w => setWallet(w))
      .catch(e => console.error(e));
  }, [session, setWallet]);

  const topUp = async () => {
    try {
      const w = await apiRequest(`/wallets/${session.user.id}/top-up`, { method: "POST", body: JSON.stringify({ amount: 500 }) });
      setWallet(w); 
      setStatus("Wallet topped up.");
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="p-5 pb-28 sm:p-8 md:pb-8 max-w-2xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-extrabold text-white">Wallet</h1>
      <p className="text-gray-400 mt-2 mb-8">Demo balance for mock payments</p>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {status && <p className="text-green-400 text-sm mb-4">{status}</p>}
      <WalletCard wallet={wallet} onTopUp={topUp} />
    </div>
  );
}
