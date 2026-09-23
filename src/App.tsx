import React, { useState } from 'react';
import { EarnWiseProvider, useEarnWise } from './context/EarnWiseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PayoutSimulatorModal } from './components/PayoutSimulatorModal';
import { DashboardView } from './views/DashboardView';
import { IncomeView } from './views/IncomeView';
import { AutoSaveView } from './views/AutoSaveView';
import { InvestView } from './views/InvestView';
import { TaxView } from './views/TaxView';
import { GoalsView } from './views/GoalsView';
import { ActivityView } from './views/ActivityView';
import { ExpensesView } from './views/ExpensesView';
import { AssistantView } from './views/AssistantView';
import { SettingsView } from './views/SettingsView';
import { X, Zap } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
            setActiveView={setActiveView}
          />
        );
      case 'income':
        return <IncomeView onOpenPayoutModal={() => setIsPayoutModalOpen(true)} />;
      case 'autosave':
        return <AutoSaveView />;
      case 'invest':
        return <InvestView />;
      case 'tax':
        return <TaxView />;
      case 'goals':
        return <GoalsView />;
      case 'activity':
        return <ActivityView />;
      case 'expenses':
        return <ExpensesView />;
      case 'assistant':
        return <AssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView 
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
            setActiveView={setActiveView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <TopNavbar
        activeView={activeView}
        onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm">
            <div className="w-72 h-full bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <span className="font-extrabold text-base text-white">EarnWise</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'income', label: 'Income Intelligence' },
                    { id: 'autosave', label: 'Auto-Save Engine' },
                    { id: 'invest', label: 'Invest Advisor' },
                    { id: 'tax', label: 'Tax Provisioning' },
                    { id: 'goals', label: 'Savings Goals' },
                    { id: 'activity', label: 'Activity & Audit Log' },
                    { id: 'expenses', label: 'Expenses (Behavioral)' },
                    { id: 'assistant', label: 'AI Copilot' },
                    { id: 'settings', label: 'Settings' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeView === item.id 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                EarnWise • Hackathon Prototype
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      {/* Payout Simulator Modal */}
      <PayoutSimulatorModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onViewActivity={() => setActiveView('activity')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EarnWiseProvider>
        <Root />
      </EarnWiseProvider>
    </AuthProvider>
  );
}

const SplashScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/25">
        <Zap className="w-6 h-6 fill-current" />
      </div>
      <div className="w-40 h-1 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full w-1/2 bg-emerald-400 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

function Root() {
  const { user, loading } = useAuth();
  const { ready } = useEarnWise();

  if (loading) return <SplashScreen />;
  if (!user) return <AuthPage />;
  if (!ready) return <SplashScreen />;

  return <AppContent />;
}
