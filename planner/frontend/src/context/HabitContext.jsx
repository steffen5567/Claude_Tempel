import React, { createContext, useState, useEffect, useContext } from 'react';
import { getHabits, createHabit as createHabitAPI, updateHabit as updateHabitAPI, deleteHabit as deleteHabitAPI } from '../services/api';

const HabitContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await getHabits();
      setHabits(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch habits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const addHabit = async (habit) => {
    try {
      const response = await createHabitAPI(habit);
      setHabits([...habits, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create habit');
      console.error(err);
      throw err;
    }
  };

  const updateHabit = async (id, updates) => {
    try {
      const response = await updateHabitAPI(id, updates);
      setHabits(habits.map(h => h.id === id ? response.data : h));
      return response.data;
    } catch (err) {
      setError('Failed to update habit');
      console.error(err);
      throw err;
    }
  };

  const removeHabit = async (id) => {
    try {
      await deleteHabitAPI(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError('Failed to delete habit');
      console.error(err);
      throw err;
    }
  };

  const refreshHabits = () => {
    fetchHabits();
  };

  return (
    <HabitContext.Provider value={{
      habits,
      loading,
      error,
      addHabit,
      updateHabit,
      removeHabit,
      refreshHabits
    }}>
      {children}
    </HabitContext.Provider>
  );
};
