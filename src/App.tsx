import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AgentDashboardPage from './pages/AgentDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<AgentDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
