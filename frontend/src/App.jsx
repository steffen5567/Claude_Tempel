import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HabitProvider } from './context/HabitContext';
import Dashboard from './pages/Dashboard';
import HabitList from './pages/HabitList';
import HabitDetail from './pages/HabitDetail';
import Goals from './pages/Goals';
import './App.css';

function App() {
  return (
    <HabitProvider>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <h1 className="app-title">Habit Tracker</h1>
              <div className="nav-links">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/habits" className="nav-link">Habits</Link>
                <Link to="/goals" className="nav-link">Goals</Link>
              </div>
            </div>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/habits" element={<HabitList />} />
              <Route path="/habits/:id" element={<HabitDetail />} />
              <Route path="/goals" element={<Goals />} />
            </Routes>
          </main>
        </div>
      </Router>
    </HabitProvider>
  );
}

export default App;
