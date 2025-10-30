import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardSkeleton from './components/Dashboard/DashboardSkeleton';
import CalendarView from './components/Calendar/CalendarView';
import { mockUnits } from './components/Calendar/mockData';
import { useBookingData } from './hooks/useBookingData';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { playSuccessSound } from './utils/soundUtils';
import { useEffect, useState } from 'react';

function App() {
  const {
    weekData,
    occupancyStats,
    occupancyNext30Days,
    reservationOrigins,
    occupancyTrend,
    availableUnits,
    loading,
    error,
    configValid,
    newCheckinCount,
    lastNewCheckin,
  } = useBookingData();

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  // Helper function to format date from YYYY-MM-DD to DD/MMM
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    return `${day}/${month}`;
  };

  // Helper function to calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn + 'T00:00:00');
    const end = new Date(checkOut + 'T00:00:00');
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  type Booking = {
    guestsDetails?: { name?: string } | null;
    guestName?: string | null;
    clientName?: string | null;
    guest?: { name?: string } | null;
    _client?: { name?: string } | null;
    client?: { name?: string } | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    stats?: { nights?: number } | null;
    guests?: number | null;
    id?: string | number | null;
  } | null | undefined;

  // Helper function to get guest name
  const getGuestName = (booking: Booking) => {
    return booking?.guestsDetails?.name
      || booking?.guestName
      || booking?.clientName
      || booking?.guest?.name
      || booking?._client?.name
      || booking?.client?.name
      || 'Hóspede sem nome';
  };

  // Trigger celebration when new checkin reservations are detected
  useEffect(() => {
    if (newCheckinCount > 0) {
      console.log('🎉 Celebração ativada! Nova reserva de check-in detectada!');

      // Show confetti
      setShowConfetti(true);

      // Play sound
      playSuccessSound();

      // Hide confetti after 10 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [newCheckinCount]);

  // Test button handler to simulate new reservation
  const handleTestCelebration = () => {
    console.log('🧪 Testando animação de celebração');

    // Show confetti
    setShowConfetti(true);

    // Play sound
    playSuccessSound();

    // Simulate a new checkin for testing (will use lastNewCheckin from real data if available)
    // If no real data, the popup will show generic message

    // Hide confetti after 10 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 10000);
  };

  return (
    <BrowserRouter>
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

              {lastNewCheckin ? (
                <div className="space-y-6 text-5xl leading-relaxed text-gray-700">
                  <div className="text-6xl font-bold text-blue-600">
                    {lastNewCheckin.id}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {getGuestName(lastNewCheckin)}
                  </div>
                  <div className="text-gray-600">
                    {formatDate(lastNewCheckin.checkInDate)} → {formatDate(lastNewCheckin.checkOutDate)}
                  </div>
                  <div className="text-gray-500">
                    {lastNewCheckin.stats?.nights || calculateNights(lastNewCheckin.checkInDate, lastNewCheckin.checkOutDate)} {(lastNewCheckin.stats?.nights || calculateNights(lastNewCheckin.checkInDate, lastNewCheckin.checkOutDate)) === 1 ? 'noite' : 'noites'} | {lastNewCheckin.guests || 0} {lastNewCheckin.guests === 1 ? 'hosp' : 'hosp'}
                  </div>
                </div>
              ) : (
                <div className="text-5xl text-gray-600">
                  {newCheckinCount} {newCheckinCount === 1 ? 'nova reserva' : 'novas reservas'} detectada{newCheckinCount === 1 ? '' : 's'}!
                </div>
              )}
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

      {/* Test Button (fixed position) */}
      <button
        onClick={handleTestCelebration}
        className="fixed z-50 px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl"
        title="Testar animação de nova reserva"
      >
        🎉 Testar Celebração
      </button>

      <Navigation />
      <Routes>
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
                  occupancyStats={occupancyStats}
                  occupancyNext30Days={occupancyNext30Days}
                  reservationOrigins={reservationOrigins}
                  occupancyTrend={occupancyTrend}
                  variousUnits={availableUnits}
                />
              )}
            </>
          }
        />
        <Route path="/calendar" element={<CalendarView units={mockUnits} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
