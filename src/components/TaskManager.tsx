'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseEdge = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default function TaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });
  const [editingTask, setEditingTask] = useState<any>(null);

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

      const response = await fetch(${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-tasks, {
        method: 'GET',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(Failed to fetch tasks: );
      }

      const { tasks } = await response.json();
      setTasks(tasks || []);
    } catch (err: any) {
      setError(err.message);
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

      const response = await fetch(${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-task, {
        method: 'POST',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error(Failed to create task: );
      }

      setNewTask({ title: '', description: '', due_date: '' });
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
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

      const response = await fetch(${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-task, {
        method: 'PUT',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTask),
      });

      if (!response.ok) {
        throw new Error(Failed to update task: );
      }

      setEditingTask(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
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

      const response = await fetch(${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-task, {
        method: 'DELETE',
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(Failed to delete task: );
      }

      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: any) => {
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
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="border border-gray-300 p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="date"
            placeholder="Due Date"
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
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
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="border border-gray-300 p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="border border-gray-300 p-2 rounded"
            />
            <input
              type="date"
              value={editingTask.due_date || ''}
              onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
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
                  Status: <span className={ont-semibold }>{task.status}</span>
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
