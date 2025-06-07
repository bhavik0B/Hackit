import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

function App() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const saveUser = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await fetch('http://localhost:5000/api/auth/save-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // ✅ Auth0 token passed correctly
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

  if (isLoading) return <h2>Loading...</h2>;

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      {!isAuthenticated ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => loginWithRedirect()}
        >
          Log in
        </button>
      ) : (
        <>
          <p>Welcome, {user.name}</p>
          <img src={user.picture} className="w-16 rounded-full" alt="User Avatar" />
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log out
          </button>
        </>
      )}
    </div>
  );
}

export default App;
