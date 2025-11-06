import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import { getHabitStats, getHabitCompletions } from '../services/api';
import './HabitDetail.css';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { habits } = useHabits();
  const habit = habits.find(h => h.id === parseInt(id));

  const [stats, setStats] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!habit) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, completionsRes] = await Promise.all([
          getHabitStats(id),
          getHabitCompletions(id)
        ]);
        setStats(statsRes.data);
        setCompletions(completionsRes.data);
      } catch (error) {
        console.error('Failed to fetch habit data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, habit]);

  if (!habit) {
    return (
      <div className="habit-detail">
        <p>Habit nicht gefunden</p>
        <button onClick={() => navigate('/habits')}>Zurück</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="habit-detail">
      <button className="back-btn" onClick={() => navigate('/habits')}>
        ← Zurück
      </button>

      <div className="habit-header" style={{ borderLeft: `4px solid ${habit.color}` }}>
        <h2>{habit.name}</h2>
        {habit.description && <p>{habit.description}</p>}
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.current_streak}</div>
            <div className="stat-label">Aktuelle Streak</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{stats.longest_streak}</div>
            <div className="stat-label">Längste Streak</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.total_completions}</div>
            <div className="stat-label">Gesamt</div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.completion_rate_30d}%</div>
            <div className="stat-label">Rate (30 Tage)</div>
          </div>
        </div>
      )}

      <div className="completions-section">
        <h3>Verlauf ({completions.length})</h3>

        {completions.length === 0 ? (
          <p className="empty-message">Noch keine Einträge vorhanden.</p>
        ) : (
          <div className="completions-list">
            {completions.map((completion) => (
              <div key={completion.id} className="completion-item">
                <div className="completion-date">
                  {formatDate(completion.completed_at)}
                </div>
                {completion.note && (
                  <div className="completion-note">{completion.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitDetail;
