import axios from 'axios';

// Use relative URL to work with the same host/port where the frontend is served
// This works because nginx serves both frontend and proxies /api to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
