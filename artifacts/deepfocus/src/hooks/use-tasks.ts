import { useState, useEffect } from 'react';

export interface Task {
  id: string;
  text: string;
  subject: string;
  completed: boolean;
  createdAt: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deepfocus-tasks');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse tasks", e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('deepfocus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string, subject: string) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      subject: subject.trim() || 'General',
      completed: false,
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  
  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  }

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted
  };
}
