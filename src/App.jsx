import React, { useState, useEffect } from 'react';
import { useLoan } from './hooks/useLoan';
import StatCard from './components/StatCard';
import GlassCard from './components/GlassCard';
import { calculatePenalty } from './utils/loanCalculations';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('lumina_config');
    return saved ? JSON.parse(saved) : {
      principal: 250000,
      interestRate: 3.45,
      monthlyPayment: 1250,
      startDate: '2023-01-01',
      marketRate: 2.5,
      extraPayments: []
    };
  });

  useEffect(() => {
    localStorage.setItem('lumina_config', JSON.stringify(config));
  }, [config]);

  const [extraPayment, setExtraPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0] });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const loan = useLoan(config);
  const penaltyData = loan ? calculatePenalty(parseFloat(extraPayment.amount), loan, config) : null;

  const handleAddExtraPayment = () => {
    if (!extraPayment.amount || !extraPayment.date) return;
    
    setConfig(prev => ({
      ...prev,
      extraPayments: [...prev.extraPayments, { ...extraPayment }].sort((a, b) => new Date(a.date) - new Date(b.date))
    }));
    setExtraPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleRemoveExtraPayment = (index) => {
    setConfig(prev => ({
      ...prev,
      extraPayments: prev.extraPayments.filter((_, i) => i !== index)
    }));
  };

  const chartData = loan ? {
    labels: loan.chartData.labels,
    datasets: [
      {
        label: 'Restschuld',
        data: loan.chartData.principal,
        borderColor: '#4f378a',
        backgroundColor: 'rgba(79, 55, 138, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Gezahlte Zinsen',
        data: loan.chartData.interest,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-surface/60 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <h1 className="font-display text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">Lumina</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-white/40 rounded-full transition-colors flex items-center gap-2 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="hidden md:inline font-medium text-sm">Konfiguration</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-variant border border-white/40 overflow-hidden">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW4vEqCwVHrmhKZdgi70wrxVfLCAFrAT16Hc1nwpomPn21ubujBymYmHQRn43tbJfKnLi0W3g_UCdVv_HgunV-x4L1wUuW8rhhibhfyqz8hFyRnXO2q1-DzfdlWEbAHl1lMYiMT_0-v9Znzu2rrvxV-rcIs9boKCA5WwPRRVSCgTZUbO64raBpH4xm7RWzzofTztsCuZh-QU07Bo4WTa9eXeH8qkb_IMDUTQEXXU67r48JAimR12UgbkYM1o6ZwEKxf0Sp4lEtD6Cn" alt="Profile" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-1">Kredit-Dashboard v2.6</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Ihre Finanz-Übersicht</h2>
          </div>
          <div className="flex items-center gap-3 bg-white/40 p-1.5 rounded-full border border-white/20">
            <button className="px-6 py-2 bg-white rounded-full shadow-sm font-medium text-sm transition-all">Übersicht</button>
            <button className="px-6 py-2 hover:bg-white/40 rounded-full font-medium text-sm transition-all text-on-surface-variant">Tilgungsplan</button>
          </div>
        </section>

        {loan && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Restschuld" 
              value={`${loan.currentBalance.toLocaleString('de-DE')} €`} 
              progress={(loan.paidPrincipal / config.principal) * 100}
            />
            <StatCard 
              label="Bereits bezahlt" 
              value={`${loan.paidPrincipal.toLocaleString('de-DE')} €`}
              trend={{ positive: true, icon: 'trending_up', text: `${((loan.paidPrincipal / config.principal) * 100).toFixed(1)}% des Kredits` }}
            />
            <StatCard 
              label="Zinslast gesamt" 
              value={`${loan.totalInterest.toLocaleString('de-DE')} €`}
              subtext="Über die Gesamtlaufzeit"
            />
            <StatCard 
              label="Restlaufzeit" 
              value={`${Math.floor(loan.remainingMonths / 12)} Jahre & ${loan.remainingMonths % 12} Monate`}
              subtext={`Voraussichtliches Ende: ${loan.endDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-display text-xl font-bold">Tilgungsverlauf</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-xs font-medium">Restschuld</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-error"></span>
                  <span className="text-xs font-medium">Zinsen</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              {chartData && <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => v.toLocaleString('de-DE') + ' €' } },
                    x: { grid: { display: false } }
                  }
                }} 
              />}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <h4 className="font-display text-xl font-bold mb-6">Sondertilgung</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Betrag (€)</label>
                    <input 
                      type="number" 
                      value={extraPayment.amount}
                      onChange={(e) => setExtraPayment({ ...extraPayment, amount: e.target.value })}
                      placeholder="z.B. 5000" 
                      className="w-full input-glass rounded-xl px-4 py-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 ml-1">Datum</label>
                    <input 
                      type="date" 
                      value={extraPayment.date}
                      onChange={(e) => setExtraPayment({ ...extraPayment, date: e.target.value })}
                      className="w-full input-glass rounded-xl px-4 py-3 font-mono text-sm"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddExtraPayment}
                  disabled={!extraPayment.amount || !extraPayment.date}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Sondertilgung hinzufügen
                </button>
                
                {penaltyData && penaltyData.penalty > 0 && (
                  <div className="p-4 rounded-xl bg-error/5 border border-error/10">
                    <div className="flex items-start gap-3 text-error">
                      <span className="material-symbols-outlined text-lg">warning</span>
                      <div>
                        <p className="text-xs font-bold uppercase">Vorfälligkeitsentschädigung</p>
                        <p className="text-sm font-medium mt-1">ca. {penaltyData.penalty.toLocaleString('de-DE')} €</p>
                      </div>
                    </div>
                  </div>
                )}

                {penaltyData && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/10 text-success">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-lg">savings</span>
                      <div>
                        <p className="text-xs font-bold uppercase">Zins-Ersparnis</p>
                        <p className="text-sm font-medium mt-1">{penaltyData.savings.toLocaleString('de-DE')} €</p>
                      </div>
                    </div>
                  </div>
                )}

                {config.extraPayments.length > 0 && (
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-xs font-bold uppercase text-on-surface-variant mb-3 ml-1">Geplante Tilgungen</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {config.extraPayments.map((ep, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/20 text-sm">
                          <div>
                            <span className="font-mono font-bold text-primary">{parseFloat(ep.amount).toLocaleString('de-DE')} €</span>
                            <span className="text-on-surface-variant ml-2 text-xs">({new Date(ep.date).toLocaleDateString('de-DE')})</span>
                          </div>
                          <button onClick={() => handleRemoveExtraPayment(i)} className="text-error/60 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="glass-card p-8 bg-primary text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="font-display text-lg font-bold mb-2">Finanz-Tipp</h4>
                <p className="text-sm text-white/80 leading-relaxed">Mit einer jährlichen Sondertilgung von nur 2% verkürzen Sie Ihre Laufzeit um fast 4 Jahre.</p>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12">lightbulb</span>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 bg-black/20 backdrop-blur-sm ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface shadow-2xl transition-transform duration-500 ease-out p-8 flex flex-col ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-bold">Konfiguration</h3>
            <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-surface-variant rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {[
              { label: 'Kreditsumme (€)', name: 'principal' },
              { label: 'Jahreszins (%)', name: 'interestRate', step: '0.01' },
              { label: 'Monatliche Rate (€)', name: 'monthlyPayment' },
              { label: 'Startdatum', name: 'startDate', type: 'date' },
              { label: 'Marktzins aktuell (%)', name: 'marketRate', step: '0.01' }
            ].map(field => (
              <div key={field.name} className="space-y-2">
                <label className="text-xs font-bold uppercase text-on-surface-variant ml-1">{field.label}</label>
                <input 
                  type={field.type || 'number'} 
                  step={field.step}
                  value={config[field.name]}
                  onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                  className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3"
                />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="mt-8 w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            Speichern & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
