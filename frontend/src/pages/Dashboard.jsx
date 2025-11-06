import React, { useState, useEffect } from 'react';
import { getDashboard, completeHabit } from '../services/api';
import { useHabits } from '../context/HabitContext';
import './Dashboard.css';

const Dashboard = () => {
  const { refreshHabits } = useHabits();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [note, setNote] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleComplete = async (habitId) => {
    setSelectedHabit(habitId);
  };

  const submitCompletion = async () => {
    if (!selectedHabit) return;

    try {
      await completeHabit(selectedHabit, note);
      setNote('');
      setSelectedHabit(null);
      fetchDashboard();
      refreshHabits();
    } catch (error) {
      console.error('Failed to complete habit', error);
    }
  };

  const cancelCompletion = () => {
    setSelectedHabit(null);
    setNote('');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const completedToday = dashboardData.filter(item => item.completed_today);
  const pendingToday = dashboardData.filter(item => !item.completed_today);

  return (
    <div className="dashboard">
      <h2>Heute</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{completedToday.length}</div>
          <div className="stat-label">Erledigt</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingToday.length}</div>
          <div className="stat-label">Ausstehend</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {dashboardData.length > 0
              ? Math.round((completedToday.length / dashboardData.length) * 100)
              : 0}%
          </div>
          <div className="stat-label">Fortschritt</div>
        </div>
      </div>

      {pendingToday.length > 0 && (
        <div className="habits-section">
          <h3>Noch zu erledigen</h3>
          <div className="habits-grid">
            {pendingToday.map(({ habit, current_streak }) => (
              <div
                key={habit.id}
                className="habit-card"
                style={{ borderLeft: `4px solid ${habit.color}` }}
              >
                <div className="habit-info">
                  <h4>{habit.name}</h4>
                  {habit.description && <p>{habit.description}</p>}
                  {current_streak > 0 && (
                    <div className="streak-badge">
                      🔥 {current_streak} Tag{current_streak !== 1 ? 'e' : ''}
                    </div>
                  )}
                </div>
                <button
                  className="complete-btn"
                  onClick={() => handleComplete(habit.id)}
                >
                  ✓ Erledigt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedToday.length > 0 && (
        <div className="habits-section">
          <h3>Heute erledigt ✓</h3>
          <div className="habits-grid">
            {completedToday.map(({ habit, current_streak }) => (
              <div
                key={habit.id}
                className="habit-card completed"
                style={{ borderLeft: `4px solid ${habit.color}` }}
              >
                <div className="habit-info">
                  <h4>{habit.name}</h4>
                  {current_streak > 0 && (
                    <div className="streak-badge">
                      🔥 {current_streak} Tag{current_streak !== 1 ? 'e' : ''}
                    </div>
                  )}
                </div>
                <div className="completed-badge">✓</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedHabit && (
        <div className="modal-overlay" onClick={cancelCompletion}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Notiz hinzufügen (optional)</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Wie lief es heute? Notizen hier..."
              rows="4"
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelCompletion}>
                Abbrechen
              </button>
              <button className="btn-primary" onClick={submitCompletion}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
