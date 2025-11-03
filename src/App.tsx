import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardSkeleton from './components/Dashboard/DashboardSkeleton';
import CalendarView from './components/Calendar/CalendarView';
import CalendarSkeleton from './components/Calendar/CalendarSkeleton';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { playSuccessSound } from './utils/soundUtils';
import { useEffect, useState } from 'react';
import { AutoRotationProvider, useAutoRotation } from './contexts/AutoRotationContext';
import { BookingDataProvider } from './contexts/BookingDataContext';
import { useDashboardData } from './hooks/useDashboardData';
import { useCalendarViewData } from './hooks/useCalendarViewData';

function AppContent() {
  const navigate = useNavigate();
  const { enabled, intervalSeconds } = useAutoRotation();

  // Use shared data context (no duplicate API calls)
  const {
    weekData,
    availableUnits,
    loading,
    error,
    configValid,
  } = useDashboardData();

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-rotation effect - recreates timer when enabled or intervalSeconds changes
  useEffect(() => {
    if (!enabled) {
      console.log('⏸️ Auto-rotation disabled');
      return;
    }

    console.log(`🚀 Starting auto-rotation: ${intervalSeconds}s interval`);

    const timer = setInterval(() => {
      const currentPath = window.location.pathname;
      console.log('🔄 Auto-rotation tick, current:', currentPath);

      if (currentPath === '/') {
        console.log('→ Navigating to Calendar');
        navigate('/calendar');
      } else {
        console.log('→ Navigating to Dashboard');
        navigate('/');
      }
    }, intervalSeconds * 1000);

    return () => {
      console.log('🛑 Stopping auto-rotation timer');
      clearInterval(timer);
    };
  }, [enabled, intervalSeconds, navigate]);

  // Test button handler to simulate celebration
  const handleTestCelebration = () => {
    console.log('🧪 Testando animação de celebração');
    setShowConfetti(true);
    playSuccessSound();
    setTimeout(() => setShowConfetti(false), 10000);
  };

  return (
    <>
      {/* Confetti Animation */}
      {showConfetti && (
        <>
          {/* Full Screen Celebration Popup */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl p-20 w-[95vw] h-[90vh] flex flex-col items-center justify-center text-center animate-pulse">
              <div className="text-[12rem] mb-12">🎉</div>
              <h1 className="mb-12 font-bold text-gray-800 text-8xl">
                Nova Reserva!
              </h1>
              <div className="text-5xl text-gray-600">
                Teste de celebração
              </div>
            </div>
          </div>

          {/* Confetti on top of popup */}
          <Confetti
            width={width}
            height={height}
            numberOfPieces={500}
            recycle={false}
            gravity={0.3}
            wind={0.01}
            style={{ zIndex: 10000 }}
          />
        </>
      )}

      {/* Test Button (fixed position)
      <button
        onClick={handleTestCelebration}
        className="fixed z-50 px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl"
        title="Testar animação de nova reserva"
      >
        🎉 Testar Celebração
      </button> */}

      <div className="transition-opacity duration-500">
        <Navigation />
        <Routes>
        <Route
          path="/calendar"
          element={<CalendarRoute />}
        />
        <Route
          path="/"
          element={
            <>
              {/* Configuration error */}
              {!configValid && (
                <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
                  <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
                      ⚠️ Configuração Incompleta
                    </h2>
                    <p className="text-[#2C3E50] mb-4">
                      Configure as variáveis de ambiente no arquivo <code className="px-2 py-1 bg-gray-100 rounded">.env</code>:
                    </p>
                    <ul className="list-disc list-inside text-[#2C3E50] mb-4 space-y-2">
                      <li><code>VITE_STAYS_CLIENT_ID</code></li>
                      <li><code>VITE_STAYS_CLIENT_SECRET</code></li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      Use o arquivo <code>.env.example</code> como referência.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {configValid && loading && (
                <>
                  <DashboardSkeleton />
                </>
              )}

              {/* Error state */}
              {configValid && !loading && error && (
                <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
                  <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
                      ❌ Erro ao Carregar Dados
                    </h2>
                    <p className="text-[#2C3E50] mb-4">{error}</p>
                    <p className="mb-4 text-sm text-gray-600">
                      Verifique suas credenciais da API Stays e tente novamente.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-[#3498db] hover:bg-[#2980b9] text-white font-semibold py-2 px-4 rounded"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}

              {/* Dashboard with data */}
              {configValid && !loading && !error && (
                <Dashboard
                  weekData={weekData}
                  variousUnits={availableUnits}
                />
              )}
            </>
          }
        />
      </Routes>
      </div>
    </>
  );
}

function CalendarRoute() {
  const { units, loading, error, configValid } = useCalendarViewData();

  // Configuration error
  if (!configValid) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
        <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
            ⚠️ Configuração Incompleta
          </h2>
          <p className="text-[#2C3E50] mb-4">
            Configure as variáveis de ambiente no arquivo <code className="px-2 py-1 bg-gray-100 rounded">.env</code>:
          </p>
          <ul className="list-disc list-inside text-[#2C3E50] mb-4 space-y-2">
            <li><code>VITE_STAYS_CLIENT_ID</code></li>
            <li><code>VITE_STAYS_CLIENT_SECRET</code></li>
          </ul>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <CalendarSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
        <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
            ❌ Erro ao Carregar Calendário
          </h2>
          <p className="text-[#2C3E50] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3498db] hover:bg-[#2980b9] text-white font-semibold py-2 px-4 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Calendar with data
  return <CalendarView units={units} />;
}

function App() {
  return (
    <BrowserRouter>
      <BookingDataProvider>
        <AutoRotationProvider>
          <AppContent />
        </AutoRotationProvider>
      </BookingDataProvider>
    </BrowserRouter>
  );
}

export default App;
