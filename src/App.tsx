import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AgentDashboardPage from './pages/AgentDashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/agent" element={<AgentDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
