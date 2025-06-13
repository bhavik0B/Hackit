// First, install React Router (run in terminal):
// npm install react-router-dom

// Create these new component files in src/components/

// 1. src/components/TeamCreation.jsx
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function TeamCreation({ onTeamCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 4
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getAccessTokenSilently } = useAuth0();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch('http://localhost:5000/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onTeamCreated(data.team);
      } else {
        setError(data.error || 'Failed to create team');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Create team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Your Team</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter team name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your team's goals or project idea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Members
          </label>
          <select
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 Members</option>
            <option value={3}>3 Members</option>
            <option value={4}>4 Members</option>
            <option value={5}>5 Members</option>
            <option value={6}>6 Members</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Team...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
}

export default TeamCreation;