// import { useAuth0 } from '@auth0/auth0-react';
// import { useEffect} from 'react';


// function App() {
//   const {
//     loginWithRedirect,
//     logout,
//     isAuthenticated,
//     user,
//     isLoading,
//     getAccessTokenSilently,
//   } = useAuth0();

//   useEffect(() => {
//     const saveUser = async () => {
//       try {
//         const token = await getAccessTokenSilently();

//         const res = await fetch('http://localhost:5000/api/auth/save-user', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`, // ✅ Auth0 token passed correctly
//           },
//           body: JSON.stringify({
//             email: user.email,
//             name: user.name,
//             picture: user.picture,
//             sub: user.sub,
//           }),
//         });

//         const data = await res.json();
//         console.log('✅ User saved:', data);
//       } catch (err) {
//         console.error('❌ Error saving user:', err);
//       }
//     };

//     if (isAuthenticated) {
//       saveUser();
//     }
//   }, [isAuthenticated, getAccessTokenSilently, user]);

//   if (isLoading) return <h2>Loading...</h2>;

//   return (
//     <div className="h-screen flex flex-col items-center justify-center space-y-4">
//       {!isAuthenticated ? (
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={() => loginWithRedirect()}
//         >
//           Log in
//         </button>
//       ) : (
//         <>
//           <p>Welcome, {user.name}</p>
//           <img src={user.picture} className="w-16 rounded-full" alt="User Avatar" />
//           <button
//             className="bg-red-600 text-white px-4 py-2 rounded"
//             onClick={() =>
//               logout({ logoutParams: { returnTo: window.location.origin } })
//             }
//           >
//             Log out
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// export default App;



// Updated App.jsx
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeamCreation from './components/TeamCreation';
import TeamDashboard from './components/TeamDashboard';

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const [userTeam, setUserTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);

  // Save user to backend
  useEffect(() => {
    const saveUser = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await fetch('http://localhost:5000/api/auth/save-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            picture: user.picture,
            sub: user.sub,
          }),
        });

        const data = await res.json();
        console.log('✅ User saved:', data);
      } catch (err) {
        console.error('❌ Error saving user:', err);
      }
    };

    if (isAuthenticated) {
      saveUser();
    }
  }, [isAuthenticated, getAccessTokenSilently, user]);

  // Check if user has a team
  useEffect(() => {
    const checkUserTeam = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:5000/api/team/my-team', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserTeam(data.team);
        } else {
          setUserTeam(null);
        }
      } catch (err) {
        console.error('Error checking user team:', err);
        setUserTeam(null);
      } finally {
        setTeamLoading(false);
      }
    };

    if (isAuthenticated) {
      checkUserTeam();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleTeamCreated = (team) => {
    setUserTeam(team);
  };

  const handleLeaveTeam = () => {
    setUserTeam(null);
  };

  if (isLoading || (isAuthenticated && teamLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold text-gray-900">Virtual Hackathon Platform</h1>
          <p className="text-xl text-gray-600">Collaborate, Code, and Create Together</p>
          
          <div className="space-y-4">
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={() => loginWithRedirect()}
            >
              🚀 Join the Hackathon
            </button>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>Team Formation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💻</span>
                <span>Real-time Coding</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Competitions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show app
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">🚀 Hackathon Platform</h1>
                {userTeam && (
                  <span className="text-sm text-gray-600">
                    Team: <span className="font-medium">{userTeam.name}</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img src={user.picture} className="w-8 h-8 rounded-full" alt="User" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() =>
                    logout({ logoutParams: { returnTo: window.location.origin } })
                  }
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                userTeam ? (
                  <Navigate to="/team" replace />
                ) : (
                  <TeamCreation onTeamCreated={handleTeamCreated} />
                )
              }
            />
            <Route
              path="/team"
              element={
                userTeam ? (
                  <TeamDashboard team={userTeam} onLeaveTeam={handleLeaveTeam} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;