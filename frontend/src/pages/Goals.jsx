import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { getGoals, createGoal, deleteGoal } from '../services/api';
import './Goals.css';

const Goals = () => {
  const { habits } = useHabits();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    habit_id: '',
    target_count: '',
    deadline: '',
    description: ''
  });

  const fetchGoals = async () => {
    try {
      const response = await getGoals();
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals', error);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createGoal(formData);
      setFormData({
        habit_id: '',
        target_count: '',
        deadline: '',
        description: ''
      });
      setShowForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Failed to create goal', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Möchten Sie dieses Ziel wirklich löschen?')) {
      try {
        await deleteGoal(id);
        fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal', error);
      }
    }
  };

  const getHabitName = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.name : 'Unknown';
  };

  const getHabitColor = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    return habit ? habit.color : '#3B82F6';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="goals-page">
      <div className="page-header">
        <h2>Ziele</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          disabled={habits.length === 0}
        >
          + Neues Ziel
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>Erstelle zuerst Habits, um Ziele setzen zu können.</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <p>Noch keine Ziele gesetzt.</p>
          <p>Setze dir Ziele, um deine Habits zu erreichen!</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const expired = isExpired(goal.deadline);
            const completed = goal.is_completed;

            return (
              <div
                key={goal.id}
                className={`goal-card ${completed ? 'completed' : ''} ${expired && !completed ? 'expired' : ''}`}
                style={{ borderLeft: `4px solid ${getHabitColor(goal.habit_id)}` }}
              >
                <div className="goal-header">
                  <h3>{getHabitName(goal.habit_id)}</h3>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(goal.id)}
                  >
                    🗑️
                  </button>
                </div>

                {goal.description && <p className="goal-description">{goal.description}</p>}

                <div className="goal-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {goal.current_count} / {goal.target_count} mal
                    {completed && ' ✓'}
                  </div>
                </div>

                <div className="goal-deadline">
                  {expired && !completed ? '⏰ Abgelaufen: ' : 'Bis: '}
                  {formatDate(goal.deadline)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Neues Ziel erstellen</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Habit *</label>
                <select
                  value={formData.habit_id}
                  onChange={(e) => setFormData({ ...formData, habit_id: e.target.value })}
                  required
                >
                  <option value="">Habit auswählen...</option>
                  {habits.map(habit => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ziel-Anzahl *</label>
                <input
                  type="number"
                  value={formData.target_count}
                  onChange={(e) => setFormData({ ...formData, target_count: e.target.value })}
                  required
                  min="1"
                  placeholder="z.B. 30"
                />
              </div>

              <div className="form-group">
                <label>Deadline *</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="z.B. 30 Tage Challenge..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn-primary">
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
