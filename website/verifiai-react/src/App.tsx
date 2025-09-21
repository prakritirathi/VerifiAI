import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import Navigation from './components/Navigation/Navigation';
import HomePage from './pages/HomePage/HomePage';
import ReportPage from './pages/ReportPage/ReportPage';
import ChatPage from './pages/ChatPage/ChatPage';
import AIAssistant from './components/AIAssistant/AIAssistant';
import { AnalysisProvider } from './context/AnalysisContext';
import './App.css';

function App() {
  return (
    <AnalysisProvider>
      <Router>
        <GlobalStyles />
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Routes>
          </main>
          <AIAssistant />
        </div>
      </Router>
    </AnalysisProvider>
  );
}

export default App;
