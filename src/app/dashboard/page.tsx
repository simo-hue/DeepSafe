import { Suspense } from 'react';
import ItalyMapDashboard from '@/components/dashboard/ItalyMapDashboard';

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500">INIZIALIZZAZIONE DATI MAPPA...</div>}>
      <ItalyMapDashboard />
    </Suspense>
  );
}
