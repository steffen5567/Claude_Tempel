import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Habits
export const getHabits = () => api.get('/habits');
export const createHabit = (habit) => api.post('/habits', habit);
export const updateHabit = (id, habit) => api.put(`/habits/${id}`, habit);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);

// Completions
export const completeHabit = (id, note) => api.post(`/habits/${id}/complete`, { note });
export const getHabitCompletions = (id) => api.get(`/habits/${id}/completions`);
export const getHabitStats = (id) => api.get(`/habits/${id}/stats`);

// Goals
export const getGoals = () => api.get('/goals');
export const createGoal = (goal) => api.post('/goals', goal);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

// Dashboard
export const getDashboard = () => api.get('/dashboard');

export default api;
