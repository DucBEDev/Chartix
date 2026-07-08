import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Header from './components/Header';
import ChatbotPanel from './components/ChatbotPanel';

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-container">
      <Header currentPath={location.pathname} />
      
      <div className="content-wrapper">
        <main className="main-area">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/news" element={<div style={{padding: 24}}>News Page (Coming Soon)</div>} />
            <Route path="/calendar" element={<div style={{padding: 24}}>Calendar Page (Coming Soon)</div>} />
          </Routes>
        </main>
        
        <ChatbotPanel />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
