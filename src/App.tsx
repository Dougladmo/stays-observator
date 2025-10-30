import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import { mockUnits } from './components/Calendar/mockData';
import { useBookingData } from './hooks/useBookingData';

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
  } = useBookingData();

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Configuration error */}
              {!configValid && (
                <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
                    <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
                      ⚠️ Configuração Incompleta
                    </h2>
                    <p className="text-[#2C3E50] mb-4">
                      Configure as variáveis de ambiente no arquivo <code className="bg-gray-100 px-2 py-1 rounded">.env</code>:
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
                <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#3498db] mb-4"></div>
                    <p className="text-[#2C3E50] text-lg font-semibold">
                      Carregando dados da API Stays...
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {configValid && !loading && error && (
                <div className="h-screen w-screen flex items-center justify-center bg-[#ecf0f1]">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
                    <h2 className="text-2xl font-bold text-[#e74c3c] mb-4">
                      ❌ Erro ao Carregar Dados
                    </h2>
                    <p className="text-[#2C3E50] mb-4">{error}</p>
                    <p className="text-sm text-gray-600 mb-4">
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
