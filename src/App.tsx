import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import CalendarView from './components/Calendar/CalendarView';
import { mockUnits } from './components/Calendar/mockData';
import {
  mockDashboardData,
  mockOccupancyStats,
  mockOccupancyNext30Days,
  mockReservationOrigins,
  mockOccupancyTrend,
  mockVariousUnits,
} from './components/Dashboard/mockData';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              weekData={mockDashboardData}
              occupancyStats={mockOccupancyStats}
              occupancyNext30Days={mockOccupancyNext30Days}
              reservationOrigins={mockReservationOrigins}
              occupancyTrend={mockOccupancyTrend}
              variousUnits={mockVariousUnits}
            />
          }
        />
        <Route path="/calendar" element={<CalendarView units={mockUnits} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
