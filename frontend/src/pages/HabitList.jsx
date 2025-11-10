import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../context/HabitContext';
import './HabitList.css';

const HabitList = () => {
  const navigate = useNavigate();
  const { habits, addHabit, removeHabit, loading } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    frequency: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addHabit(formData);
      setFormData({ name: '', description: '', color: '#3B82F6', frequency: 1 });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create habit', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      try {
        await removeHabit(id);
      } catch (error) {
        console.error('Failed to delete habit', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="habit-list-page">
      <div className="page-header">
        <h2>Meine Habits</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Neues Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>Noch keine Habits erstellt.</p>
          <p>Erstelle dein erstes Habit, um zu beginnen!</p>
        </div>
      ) : (
        <div className="habits-list">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="habit-item"
              style={{ borderLeft: `4px solid ${habit.color}` }}
            >
              <div
                className="habit-item-content"
                onClick={() => navigate(`/habits/${habit.id}`)}
              >
                <h3>{habit.name}</h3>
                {habit.description && <p>{habit.description}</p>}
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(habit.id, habit.name);
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Neues Habit erstellen</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="z.B. Sport, Lesen, Meditation"
                />
              </div>

              <div className="form-group">
                <label>Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details zum Habit..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Frequenz (Tage Cooldown)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) || 1 })}
                  placeholder="1 = täglich, 2 = alle 2 Tage, etc."
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  {formData.frequency === 1 ? 'Täglich verfügbar' : `Verfügbar alle ${formData.frequency} Tage`}
                </small>
              </div>

              <div className="form-group">
                <label>Farbe</label>
                <div className="color-picker">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
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

export default HabitList;
