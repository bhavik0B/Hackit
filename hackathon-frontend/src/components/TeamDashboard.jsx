// 2. src/components/TeamDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import InviteMember from './InviteMember';

function TeamDashboard({ team: initialTeam, onLeaveTeam }) {
  const [team, setTeam] = useState(initialTeam);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, getAccessTokenSilently } = useAuth0();

  const isLeader = team?.leader?._id === user?.sub || team?.leader?.auth0Id === user?.sub;

  const refreshTeamData = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/team/my-team', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data.team);
      }
    } catch (err) {
      console.error('Error refreshing team data:', err);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/team/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: team._id }),
      });

      if (response.ok) {
        onLeaveTeam();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to leave team');
      }
    } catch (err) {
      alert('Error leaving team');
      console.error('Leave team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMemberRole = (member) => {
    return member.role === 'leader' ? '👑 Leader' : '👤 Member';
  };

  if (!team) {
    return <div className="text-center">Loading team data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      {/* Team Header */}
      <div className="border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="text-gray-600 mt-2">{team.description}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{team.members?.length || 0}/{team.maxMembers} Members</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isLeader && (
              <button
                onClick={() => setShowInviteModal(true)}
                disabled={team.members?.length >= team.maxMembers}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Invite Member
              </button>
            )}
            
            {!isLeader && (
              <button
                onClick={handleLeaveTeam}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Leaving...' : 'Leave Team'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {team.members?.map((member, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
              <img
                src={member.user?.avatar || member.user?.picture || 'https://via.placeholder.com/40'}
                alt={member.user?.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-600">{member.user?.email}</p>
              </div>
              <div className="text-sm text-gray-500">
                {getMemberRole(member)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {isLeader && team.invitations?.filter(inv => inv.status === 'pending').length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Pending Invitations</h2>
          <div className="space-y-2">
            {team.invitations
              .filter(inv => inv.status === 'pending')
              .map((invitation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-600">
                      Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-yellow-600 font-medium">Pending</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Team Workspace Actions */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-4">Team Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💻</div>
            <h3 className="font-medium">Code Editor</h3>
            <p className="text-sm text-gray-600">Collaborative coding</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-medium">Team Chat</h3>
            <p className="text-sm text-gray-600">Real-time messaging</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📹</div>
            <h3 className="font-medium">Video Call</h3>
            <p className="text-sm text-gray-600">Face-to-face discussion</p>
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMember
          teamId={team._id}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={refreshTeamData}
        />
      )}
    </div>
  );
}

export default TeamDashboard;