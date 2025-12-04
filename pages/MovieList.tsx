
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies, deleteMovie } from '../services/api';
import { Movie } from '../types';
import { Edit2, Trash2, Plus, Search, Star } from 'lucide-react';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMovies = async () => {
    setLoading(true);
    const res = await getMovies();
    if (res.success && res.data) {
      setMovies(res.data);
      setFilteredMovies(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = movies.filter(m => 
      m.title.toLowerCase().includes(lower) || 
      m.country.toLowerCase().includes(lower) ||
      (m.genre && m.genre.toLowerCase().includes(lower)) ||
      m.contentType.toLowerCase().includes(lower)
    );
    setFilteredMovies(filtered);
  }, [search, movies]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
        await deleteMovie(id);
        fetchMovies();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Content Library</h2>
        <button 
          onClick={() => navigate('/admin/upload')}
          className="bg-netflix-red text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#c11119] transition-colors"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-800">
        <div className="relative mb-6">
           <Search className="absolute left-3 top-3 text-gray-500" size={20} />
           <input 
             type="text" 
             placeholder="Search by title, genre, country..." 
             className="w-full bg-[#141414] border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded focus:border-white focus:outline-none placeholder-gray-500"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-400">
            <thead className="bg-[#141414] text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-4 py-3 rounded-l">Poster</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Popular</th>
                <th className="px-4 py-3 text-right rounded-r">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
              ) : filteredMovies.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">No movies found.</td></tr>
              ) : (
                filteredMovies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <img src={movie.posterPath} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                        {movie.title}
                        <div className="text-[10px] text-gray-500">{movie.contentType}</div>
                    </td>
                    <td className="px-4 py-3">
                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">{movie.genre || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{movie.year || '-'}</td>
                    <td className="px-4 py-3">{movie.country}</td>
                    <td className="px-4 py-3">
                        {movie.isPopular ? <Star size={16} className="text-yellow-500" fill="currentColor"/> : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/upload?edit=${movie.id}`)}
                          className="p-2 hover:bg-white/10 rounded text-blue-400"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(movie.id)}
                          className="p-2 hover:bg-white/10 rounded text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-right">
            Showing {filteredMovies.length} results
        </div>
      </div>
    </div>
  );
};

export default MovieList;
