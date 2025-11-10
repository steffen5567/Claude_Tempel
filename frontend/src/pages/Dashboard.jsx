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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for cooldown display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

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

  const formatCooldownTime = (cooldownEnd) => {
    if (!cooldownEnd) return '';

    const end = new Date(cooldownEnd);
    const now = currentTime;
    const diff = end - now;

    if (diff <= 0) return 'Bereit!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}T ${remainingHours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const availableHabits = dashboardData.filter(item => item.is_available);
  const cooldownHabits = dashboardData.filter(item => item.on_cooldown);

  return (
    <div className="dashboard">
      <h2>Heute</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{availableHabits.length}</div>
          <div className="stat-label">Verfügbar</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{cooldownHabits.length}</div>
          <div className="stat-label">Cooldown</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {dashboardData.length > 0
              ? Math.round((cooldownHabits.length / dashboardData.length) * 100)
              : 0}%
          </div>
          <div className="stat-label">In Pause</div>
        </div>
      </div>

      {availableHabits.length > 0 && (
        <div className="habits-section">
          <h3>Verfügbar ✓</h3>
          <div className="habits-grid">
            {availableHabits.map(({ habit, current_streak }) => (
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
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Frequenz: alle {habit.frequency} Tag{habit.frequency !== 1 ? 'e' : ''}
                  </div>
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

      {cooldownHabits.length > 0 && (
        <div className="habits-section">
          <h3>Im Cooldown ⏰</h3>
          <div className="habits-grid">
            {cooldownHabits.map(({ habit, current_streak, cooldown_end }) => (
              <div
                key={habit.id}
                className="habit-card cooldown"
                style={{
                  borderLeft: `4px solid ${habit.color}`,
                  opacity: 0.6,
                  background: '#f5f5f5'
                }}
              >
                <div className="habit-info">
                  <h4 style={{ color: '#999' }}>{habit.name}</h4>
                  {current_streak > 0 && (
                    <div className="streak-badge">
                      🔥 {current_streak} Tag{current_streak !== 1 ? 'e' : ''}
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginTop: '0.5rem',
                    fontWeight: '500'
                  }}>
                    ⏰ Verfügbar in: {formatCooldownTime(cooldown_end)}
                  </div>
                </div>
                <div className="cooldown-badge" style={{
                  background: '#ddd',
                  color: '#666',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  Cooldown
                </div>
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
