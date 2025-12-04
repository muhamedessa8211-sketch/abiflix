
import React, { useEffect, useState, useRef } from 'react';
import { getMovies } from '../services/api';
import { Movie, ContentType, Country, Genre } from '../types';
import { Play, Info, X, ChevronRight, ChevronLeft, Search, Sparkles, Send, Bot, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const Navbar = ({ onSearch, toggleAiChat }: { onSearch: (query: string) => void, toggleAiChat: () => void }) => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            onSearch(''); // Clear search on close
        }
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${scrolled ? 'bg-[#141414]' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
            <div className="flex items-center gap-8">
                <h1 className="text-3xl font-bold text-netflix-red tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>NETFLEX</h1>
                <div className="hidden md:flex gap-4 text-sm font-medium text-gray-200">
                    <a href="#" className="hover:text-gray-400 transition">Home</a>
                    <a href="#series" className="hover:text-gray-400 transition">Series</a>
                    <a href="#movies" className="hover:text-gray-400 transition">Movies</a>
                    <a href="#new" className="hover:text-gray-400 transition">New & Popular</a>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className={`flex items-center border transition-all duration-300 ${isSearchOpen ? 'border-white bg-black/80 px-2 py-1' : 'border-transparent bg-transparent'}`}>
                    <Search 
                        size={20} 
                        className="cursor-pointer text-white" 
                        onClick={toggleSearch}
                    />
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="Titles, people, genres" 
                        className={`bg-transparent border-none text-white text-sm outline-none ml-2 transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0'}`}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                
                {/* AI Chat Toggle */}
                <button onClick={toggleAiChat} className="text-purple-400 hover:text-white transition-colors flex items-center gap-1 group" title="AI Recommendation">
                    <Sparkles size={20} className="group-hover:animate-pulse"/>
                    <span className="hidden md:block text-xs font-bold uppercase tracking-wider">Ask AI</span>
                </button>

                <Link to="/login" className="bg-netflix-red text-white px-4 py-1.5 rounded-sm text-sm font-medium hover:bg-[#c11119]">Sign In</Link>
            </div>
        </nav>
    );
};

// --- Components ---

const MovieRow: React.FC<{ title: string; movies: Movie[]; onPlay: (m: Movie) => void }> = ({ title, movies, onPlay }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    
    if (movies.length === 0) return null;

    const scroll = (offset: number) => {
        if (rowRef.current) {
            rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-8 pl-4 md:pl-12 relative group">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 hover:text-blue-500 cursor-pointer inline-flex items-center gap-2 group/title">
                {title} <span className="text-sm text-blue-500 opacity-0 group-hover/title:opacity-100 transition-opacity flex items-center">Explore All <ChevronRight size={14}/></span>
            </h3>
            
            <div className="relative">
                <button 
                  onClick={() => scroll(-500)}
                  className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all h-full"
                >
                    <ChevronLeft size={32} />
                </button>

                <div ref={rowRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-pl-12 pb-4">
                    {movies.map(movie => (
                        <div 
                            key={movie.id} 
                            className="flex-none w-[160px] md:w-[220px] aspect-[2/3] relative rounded overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:z-30"
                            onClick={() => onPlay(movie)}
                        >
                            <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <h4 className="text-white font-bold text-sm drop-shadow-md">{movie.title}</h4>
                                <div className="flex flex-wrap gap-1 text-[10px] font-semibold text-green-400 mt-1">
                                    <span>{movie.year || '2025'}</span>
                                    <span className="text-white">•</span>
                                    <span className="bg-gray-700 text-white px-1 rounded text-[9px]">{movie.genre}</span>
                                </div>
                            </div>
                            {movie.isPopular && (
                                <div className="absolute top-2 right-2 bg-netflix-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                    TOP 10
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button 
                  onClick={() => scroll(500)}
                  className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all h-full"
                >
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
};

const VideoModal: React.FC<{ movie: Movie | null; onClose: () => void }> = ({ movie, onClose }) => {
    if (!movie) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl bg-[#141414] rounded-lg overflow-hidden shadow-2xl">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-[#181818] rounded-full p-2 hover:bg-white hover:text-black transition-all"
                >
                    <X size={24} />
                </button>
                <div className="aspect-video w-full bg-black">
                    <video 
                        src={movie.videoPath} 
                        controls 
                        autoPlay 
                        className="w-full h-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-3xl font-bold">{movie.title}</h2>
                        <span className="border border-gray-500 px-2 py-0.5 text-sm text-gray-400">HD</span>
                        {movie.isPopular && <span className="bg-netflix-red text-white px-2 py-0.5 text-sm font-bold rounded">Most Liked</span>}
                    </div>
                    <div className="flex gap-2 mb-4 text-sm font-semibold">
                        <span className="text-green-500">98% Match</span>
                        <span className="text-gray-400">{movie.year || new Date(movie.createdAt).getFullYear()}</span>
                        <span className="text-gray-400">{movie.contentType}</span>
                        <span className="text-gray-400">{movie.genre}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed max-w-2xl">{movie.description}</p>
                </div>
            </div>
        </div>
    );
};

interface AiChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    allMovies: Movie[];
    recentlyWatched: Movie[];
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, allMovies, recentlyWatched }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Hey there! I'm your Netflex movie concierge. Tell me what you're in the mood for, or ask for a recommendation based on what you've watched!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Context preparation
            const catalogContext = allMovies.map(m => `- ${m.title} (${m.year}, ${m.genre}, ${m.country}): ${m.description}`).join('\n');
            
            let historyContext = "";
            if (recentlyWatched.length > 0) {
                historyContext = `The user has recently watched/clicked on: ${recentlyWatched.map(m => `${m.title} (${m.genre})`).join(', ')}. Use this to personalize recommendations (e.g. "Since you liked X...").`;
            } else {
                historyContext = "The user has not watched anything in this session yet.";
            }

            const prompt = `You are an enthusiastic and knowledgeable movie recommendation assistant for Netflex.
            
            CATALOG OF AVAILABLE MOVIES:
            ${catalogContext}

            USER SESSION CONTEXT:
            ${historyContext}

            USER QUERY: "${userMsg}"
            
            INSTRUCTIONS:
            1. Recommend 1-3 movies strictly from the CATALOG above.
            2. If the user's history is relevant, reference it to explain your choice.
            3. If the query is vague (e.g., "something good"), use the popular or high-quality items from the catalog.
            4. Keep the tone friendly, brief (max 3 sentences), and engaging.
            5. Do not make up movies. Only use the ones listed.
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            setMessages(prev => [...prev, { role: 'ai', text: response.text || "I couldn't find a perfect match, but take a look around the popular section!" }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: "I'm having a bit of trouble connecting to the movie database right now. Try again in a moment!" }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[70] w-96 h-[500px] bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-300" size={18} />
                    <div>
                        <h3 className="font-bold text-white text-sm">Netflex Assistant</h3>
                        {recentlyWatched.length > 0 && <span className="text-[10px] text-purple-200 flex items-center gap-1"><History size={8}/> Personalizing results</span>}
                    </div>
                </div>
                <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                            msg.role === 'user' ? 'bg-netflix-red text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                         <div className="bg-gray-800 p-3 rounded-lg rounded-bl-none flex gap-1">
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                             <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                         </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-800 bg-[#141414] flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask for a recommendation..."
                    className="flex-1 bg-[#2f2f2f] text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

const ClientHome: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [featured, setFeatured] = useState<Movie | null>(null);
    const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiChatOpen, setIsAiChatOpen] = useState(false);
    const [recentlyWatched, setRecentlyWatched] = useState<Movie[]>([]);

    useEffect(() => {
        const load = async () => {
            const res = await getMovies();
            if (res.success && res.data) {
                setMovies(res.data);
                // Pick random featured
                if (res.data.length > 0) {
                    const random = res.data[Math.floor(Math.random() * res.data.length)];
                    setFeatured(random);
                }
            }
        };
        load();
    }, []);

    const handlePlayMovie = (movie: Movie) => {
        setPlayingMovie(movie);
        setRecentlyWatched(prev => {
            // Avoid duplicates at the top
            const filtered = prev.filter(p => p.id !== movie.id);
            return [movie, ...filtered].slice(0, 5); // Keep last 5 unique items
        });
    };

    // Filter Logic
    const getByCat = (type: ContentType) => movies.filter(m => m.contentType === type);
    const getByCountry = (country: Country) => movies.filter(m => m.country === country);
    const getByGenre = (genre: Genre) => movies.filter(m => m.genre === genre);
    const getPopular = () => movies.filter(m => m.isPopular);
    
    // Sort by Year descending (New releases)
    const getNewReleases = () => [...movies].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 10);

    // Search Logic
    const searchResults = searchQuery 
        ? movies.filter(m => 
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.genre && m.genre.toLowerCase().includes(searchQuery.toLowerCase()))
          ) 
        : [];

    return (
        <div className="bg-[#141414] min-h-screen text-white pb-20">
            <Navbar onSearch={setSearchQuery} toggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)} />

            {searchQuery ? (
                // Search Results View
                <div className="pt-28 px-4 md:px-12 min-h-screen">
                    <h2 className="text-gray-400 mb-6 text-lg">Results for "{searchQuery}"</h2>
                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {searchResults.map(movie => (
                                <div 
                                    key={movie.id} 
                                    className="aspect-[2/3] relative rounded bg-gray-900 overflow-hidden cursor-pointer transition-transform hover:scale-105"
                                    onClick={() => handlePlayMovie(movie)}
                                >
                                    <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <Play className="text-white" fill="white" size={40} />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <p className="text-sm font-bold text-white text-center truncate">{movie.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-20">
                            <p className="text-xl">Your search for "{searchQuery}" did not have any matches.</p>
                            <p className="mt-2 text-sm">Suggestions:</p>
                            <ul className="text-sm mt-1 list-disc list-inside">
                                <li>Try different keywords</li>
                                <li>Looking for a movie or TV show?</li>
                                <li>Try using a movie title, or series name</li>
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                // Standard Home View
                <>
                    {/* Hero Section */}
                    {featured && (
                        <div className="relative h-[85vh] w-full">
                            {/* Background Image with Gradient Overlay */}
                            <div className="absolute inset-0">
                                <img src={featured.posterPath} alt={featured.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-black/50 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
                            </div>

                            <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-12 max-w-2xl pt-20">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-netflix-red font-bold tracking-widest uppercase text-sm">N Series</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg leading-none">{featured.title}</h1>
                                <p className="text-lg text-gray-200 mb-8 drop-shadow-md line-clamp-3">{featured.description}</p>
                                
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handlePlayMovie(featured)}
                                        className="bg-white text-black px-8 py-3 rounded flex items-center gap-2 font-bold hover:bg-opacity-80 transition"
                                    >
                                        <Play fill="black" size={24} /> Play
                                    </button>
                                    <button className="bg-gray-500/70 text-white px-8 py-3 rounded flex items-center gap-2 font-bold hover:bg-opacity-50 transition">
                                        <Info size={24} /> More Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rows */}
                    <div className="-mt-32 relative z-20 space-y-4">
                        <MovieRow title="New Releases" movies={getNewReleases()} onPlay={handlePlayMovie} />
                        <MovieRow title="Popular on Netflex" movies={getPopular()} onPlay={handlePlayMovie} />
                        
                        <MovieRow title="Turkish Movies & TV" movies={getByCountry(Country.Turkey)} onPlay={handlePlayMovie} />
                        <MovieRow title="Korean TV Dramas" movies={getByCountry(Country.Korea)} onPlay={handlePlayMovie} />
                        <MovieRow title="Indian Cinema" movies={getByCountry(Country.India)} onPlay={handlePlayMovie} />
                        
                        <MovieRow title="Action Movies" movies={getByGenre(Genre.Action)} onPlay={handlePlayMovie} />
                        <MovieRow title="Sci-Fi & Fantasy" movies={getByGenre(Genre.SciFi)} onPlay={handlePlayMovie} />
                        <MovieRow title="Dramas" movies={getByGenre(Genre.Drama)} onPlay={handlePlayMovie} />
                        <MovieRow title="US Hits" movies={getByCountry(Country.America)} onPlay={handlePlayMovie} />
                    </div>
                </>
            )}

            {/* Video Player Overlay */}
            <VideoModal movie={playingMovie} onClose={() => setPlayingMovie(null)} />
            
            {/* AI Assistant Chat */}
            <AiChatModal isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} allMovies={movies} recentlyWatched={recentlyWatched} />
        </div>
    );
};

export default ClientHome;
