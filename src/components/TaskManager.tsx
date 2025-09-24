'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { getSupabaseClient } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', description: '', due_date: '' });
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session found. Please log in.');
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-tasks`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const { tasks: fetchedTasks } = await response.json();
      setTasks(fetchedTasks || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session found.');

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      setNewTask({ title: '', description: '', due_date: '' });
      fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while creating task');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session found.');

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-task`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTask),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      setEditingTask(null);
      fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while updating task');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session found.');

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-task`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while deleting task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask({ ...task, due_date: task.due_date || '' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTasks([]);
    window.location.href = '/';
  };

  if (loading && tasks.length === 0) return <div className="text-center p-8">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Log Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={createTask} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, title: e.target.value })}
            className="border border-gray-300 p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, description: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="date"
            value={newTask.due_date || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, due_date: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      {editingTask && (
        <form onSubmit={updateTask} className="bg-yellow-50 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={editingTask.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="border border-gray-300 p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={editingTask.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="border border-gray-300 p-2 rounded"
            />
            <input
              type="date"
              value={editingTask.due_date || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTask({ ...editingTask, due_date: e.target.value })}
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
            <button
              onClick={() => setEditingTask(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tasks.length === 0 && !loading ? (
          <p className="text-center text-gray-500 py-8">No tasks yet. Create one above!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className={`font-semibold ${task.status === 'Complete' ? 'text-green-600' : task.status === 'In Progress' ? 'text-yellow-600' : 'text-blue-600'}`}>{task.status}</span>
                </p>
                {task.due_date && (
                  <p className="text-sm text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
