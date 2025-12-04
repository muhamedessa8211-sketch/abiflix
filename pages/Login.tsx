import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { login } from '../services/api';
    
    const Login: React.FC = () => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
          const res = await login(username, password);
          if (res.success) {
            navigate('/admin/dashboard');
          } else {
            setError(res.message || 'Login failed');
          }
        } catch (err) {
          setError('An unexpected error occurred');
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: 'url("https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg")' }}>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          
          <div className="relative z-10 w-full max-w-md bg-black bg-opacity-75 p-16 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8">Sign In</h2>
            
            {error && (
              <div className="bg-[#e87c03] text-white p-3 rounded mb-4 text-sm font-medium">
                {error}
              </div>
            )}
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#333] text-white rounded px-5 py-3.5 focus:outline-none focus:bg-[#454545] placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password (admin123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#333] text-white rounded px-5 py-3.5 focus:outline-none focus:bg-[#454545] placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-netflix-red text-white font-bold py-3.5 rounded mt-6 hover:bg-[#c11119] transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-8 text-gray-400 text-sm">
              <p>New to Netflex? <span className="text-white hover:underline cursor-pointer">Sign up now.</span></p>
            </div>
          </div>
        </div>
      );
    };
    
    export default Login;