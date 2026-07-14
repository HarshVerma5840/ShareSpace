import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNav from './AppNav';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen md:h-screen w-full relative bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden selection:bg-[#3a86ff]/30 selection:text-[#3a86ff]">
      <AppNav />
      <main className="flex-1 relative z-10 w-full pb-[92px] md:pb-0 h-full overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
