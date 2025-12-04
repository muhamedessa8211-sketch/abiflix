
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createMovie, getMovieById, updateMovie, mockFileUpload } from '../services/api';
import { ContentType, Country, Genre, Movie } from '../types';
import InputField from '../components/InputField';
import { Image, Video, Check, Loader2, ArrowLeft, MonitorPlay, Star, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const MovieUpload: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.Single);
  const [country, setCountry] = useState<Country>(Country.India);
  const [genre, setGenre] = useState<Genre>(Genre.Action);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isPopular, setIsPopular] = useState<boolean>(false);
  
  // Files
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Previews (for editing or upload preview)
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    if (editId) {
      const loadMovie = async () => {
        const res = await getMovieById(editId);
        if (res.success && res.data) {
          setTitle(res.data.title);
          setDescription(res.data.description);
          setContentType(res.data.contentType);
          setCountry(res.data.country);
          setGenre(res.data.genre);
          setYear(res.data.year);
          setIsPopular(res.data.isPopular);
          setPosterPreview(res.data.posterPath);
          setVideoPreview(res.data.videoPath);
        }
        setFetching(false);
      };
      loadMovie();
    }
  }, [editId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'poster') {
        setPosterFile(file);
        setPosterPreview(URL.createObjectURL(file));
      } else {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file)); // Session-based preview
      }
    }
  };

  const generateDescription = async () => {
    if (!title || !genre) {
        setMsg({ type: 'error', text: 'Please enter a Title and Genre to generate a description.' });
        return;
    }
    setAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a compelling and dramatic 2-sentence synopsis for a ${genre} movie titled "${title}". The description should sound like a Netflix movie summary.`,
        });
        const text = response.text;
        if (text) {
            setDescription(text);
        }
    } catch (error) {
        console.error("AI Generation failed", error);
        setMsg({ type: 'error', text: 'Failed to generate description with AI.' });
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // 1. Upload Files (Mocking Multer)
      let finalPosterPath = posterPreview;
      let finalVideoPath = videoPreview;

      if (posterFile) {
        finalPosterPath = await mockFileUpload(posterFile);
      }
      
      if (videoFile) {
        // In a real app, upload video. Here we use the ObjectURL for session demo or a placeholder string if too big
        // For persistence in this specific demo, we'll assume the URL is valid or use a mock path if it's a new file
        finalVideoPath = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; 
      }

      const movieData = {
        title,
        description,
        contentType,
        country,
        genre,
        year,
        isPopular,
        posterPath: finalPosterPath,
        videoPath: finalVideoPath
      };

      if (editId) {
        await updateMovie(editId, movieData);
        setMsg({ type: 'success', text: 'Movie updated successfully!' });
      } else {
        await createMovie(movieData);
        setMsg({ type: 'success', text: 'Movie uploaded successfully!' });
        // Reset form if create
        setTitle('');
        setDescription('');
        setPosterFile(null);
        setVideoFile(null);
        setPosterPreview('');
        setVideoPreview('');
        setYear(new Date().getFullYear());
        setIsPopular(false);
      }
      
      // Navigate back after short delay
      setTimeout(() => navigate('/admin/movies'), 1500);

    } catch (error) {
      setMsg({ type: 'error', text: 'Operation failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-white"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/movies')} className="text-gray-400 hover:text-white">
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-white">{editId ? 'Edit Content' : 'Upload Content'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-[#1f1f1f] p-6 rounded-lg border border-gray-800">
          {msg.text && (
            <div className={`p-4 rounded mb-6 ${msg.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField 
              label="Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-gray-400 text-sm font-medium">Description</label>
                    <button 
                        type="button" 
                        onClick={generateDescription}
                        disabled={aiLoading}
                        className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50"
                    >
                        {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                        Auto-Generate
                    </button>
                </div>
                <textarea 
                    className="w-full bg-[#333] text-white border border-transparent focus:border-white focus:ring-0 rounded px-4 py-3 placeholder-gray-400 outline-none transition-colors min-h-[100px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Content Type" 
                as="select" 
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                options={Object.values(ContentType).map(v => ({ label: v, value: v }))}
              />
              <InputField 
                label="Country" 
                as="select" 
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
                options={Object.values(Country).map(v => ({ label: v, value: v }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Genre" 
                    as="select" 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as Genre)}
                    options={Object.values(Genre).map(v => ({ label: v, value: v }))}
                />
                <InputField 
                    label="Release Year" 
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min="1900"
                    max="2099"
                />
            </div>

            <div className="mb-4">
                 <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-500 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={isPopular} 
                        onChange={(e) => setIsPopular(e.target.checked)}
                        className="w-5 h-5 text-netflix-red rounded focus:ring-netflix-red bg-gray-700 border-gray-600"
                    />
                    <div className="flex flex-col">
                        <span className="text-white font-medium">Mark as Popular</span>
                        <span className="text-xs text-gray-400">Features this content in the "Trending" sections</span>
                    </div>
                    {isPopular && <Star className="text-yellow-500 ml-auto" size={20} fill="currentColor"/>}
                 </label>
            </div>

            <div className="space-y-6 mt-6 border-t border-gray-800 pt-6">
              {/* Poster Upload */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Poster Image</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-600 rounded hover:border-white transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'poster')} className="hidden" />
                    {posterPreview ? (
                      <img src={posterPreview} alt="Preview" className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="mx-auto mb-1" />
                        <span className="text-xs">Select Image</span>
                      </div>
                    )}
                  </label>
                  <div className="text-sm text-gray-500 flex-1">
                    <p>Upload a cover image.</p>
                    <p>Recommended ratio: 2:3</p>
                    <p>Max size: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Video File</label>
                <div className="border border-gray-700 rounded p-4 bg-black/30">
                  <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-700 file:text-white
                    hover:file:bg-gray-600
                  "/>
                  {videoPreview && (
                    <div className="mt-4">
                       <p className="text-xs text-green-500 mb-1 flex items-center gap-1"><Check size={12}/> Video Selected</p>
                       <video src={videoPreview} controls className="w-full h-48 bg-black rounded" />
                    </div>
                  )}
                  {!videoFile && !videoPreview && (
                      <p className="text-xs text-yellow-600 mt-2">
                          Note: In this demo, if you don't upload a video, a sample video will be used.
                      </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
               <button 
                type="submit" 
                disabled={loading}
                className="bg-netflix-red hover:bg-[#c11119] text-white px-8 py-3 rounded font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                 {loading && <Loader2 className="animate-spin" size={20}/>}
                 {editId ? 'Update Movie' : 'Publish Movie'}
               </button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <h3 className="text-gray-400 font-medium mb-4">Preview</h3>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-800 sticky top-4">
            <div className="aspect-[2/3] w-full bg-black rounded overflow-hidden relative group">
                {posterPreview ? (
                    <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Poster</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-black rounded-full p-3">
                        <MonitorPlay fill="black" />
                    </div>
                </div>
                {isPopular && (
                    <div className="absolute top-2 right-2 bg-netflix-red text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        POPULAR
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h4 className="text-white font-bold text-lg leading-tight">{title || 'Movie Title'}</h4>
                <div className="flex gap-2 text-xs text-green-400 font-semibold mt-1">
                    <span>98% Match</span>
                    <span className="text-gray-400 border border-gray-600 px-1 text-[10px] rounded">HD</span>
                    <span className="text-gray-400">{year}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-2">
                    <span>{genre}</span>
                    <span>•</span>
                    <span>{contentType}</span>
                    <span>•</span>
                    <span>{country}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 italic">
                    {description || 'No description yet.'}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieUpload;
