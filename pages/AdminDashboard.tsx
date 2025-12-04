
import React, { useEffect, useState } from 'react';
import { getMovies } from '../services/api';
import { Movie, ContentType, Country } from '../types';
import { Film, MonitorPlay, Globe, Star, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: number; icon: React.FC<any>; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#1f1f1f] p-6 rounded-lg border border-gray-800 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm font-medium uppercase">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await getMovies();
      if (res.success && res.data) {
        setMovies(res.data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-white p-4">Loading stats...</div>;

  const totalMovies = movies.length;
  const seriesCount = movies.filter(m => m.contentType === ContentType.Series).length;
  const popularCount = movies.filter(m => m.isPopular).length;
  
  // Group by country
  const countryCounts = movies.reduce((acc, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by Genre
  const genreCounts = movies.reduce((acc, curr) => {
    const g = curr.genre || 'Uncategorized';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Content" value={totalMovies} icon={Film} color="text-red-500" />
        <StatCard title="Series" value={seriesCount} icon={MonitorPlay} color="text-blue-500" />
        <StatCard title="Trending" value={popularCount} icon={TrendingUp} color="text-purple-500" />
        <StatCard title="Countries" value={Object.keys(countryCounts).length} icon={Globe} color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular / Trending List */}
        <div className="lg:col-span-2 bg-[#1f1f1f] rounded-lg border border-gray-800 p-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star size={18} className="text-yellow-500" fill="currentColor"/> 
                  Popular Content
              </h3>
              <span className="text-xs text-gray-500">Flagged as Popular</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movies.filter(m => m.isPopular).slice(0, 6).map(movie => (
                  <div key={movie.id} className="flex items-center gap-3 bg-white/5 p-2 rounded border border-transparent hover:border-gray-700 transition">
                      <img src={movie.posterPath} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                      <div className="min-w-0">
                          <h4 className="font-medium text-white truncate text-sm">{movie.title}</h4>
                          <p className="text-[10px] text-gray-400">{movie.genre} • {movie.year}</p>
                      </div>
                  </div>
              ))}
           </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-6">
           <h3 className="text-lg font-bold text-white mb-4">Genre Distribution</h3>
           <div className="space-y-3">
             {Object.entries(genreCounts).map(([genre, count]) => (
                <div key={genre} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                       <span className="text-gray-300">{genre}</span>
                   </div>
                   <span className="text-gray-500 font-medium">{count}</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Uploads</h3>
          <div className="space-y-4">
            {movies.slice(0, 5).map(movie => (
              <div key={movie.id} className="flex items-center gap-4 p-2 hover:bg-white/5 rounded transition-colors">
                <img src={movie.posterPath} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium text-white">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.contentType} • {movie.country}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 block">{new Date(movie.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {movies.length === 0 && <p className="text-gray-500">No movies uploaded yet.</p>}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-[#1f1f1f] rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Regional Distribution</h3>
          <div className="space-y-4">
            {Object.entries(countryCounts).map(([country, count]) => (
              <div key={country} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{country}</span>
                  <span className="text-gray-500">{count} titles</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-netflix-red h-2 rounded-full" 
                    style={{ width: `${(count / totalMovies) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
