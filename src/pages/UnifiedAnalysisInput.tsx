import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, AlertCircle, Loader2, Type, BarChart3, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase'

// ✅ Supabase Client Setup

// ✅ API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AnalysisInputProps {
  onAnalysisComplete?: (data: any) => void;
}

export default function UnifiedAnalysisInput({ onAnalysisComplete }: AnalysisInputProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Check authentication on mount
  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', session.user.id);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        console.log('❌ User not authenticated');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', session.user.id);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        console.log('❌ User not authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUserId(null);
      setIsAuthenticated(false);
    }
  };

  // Validation functions
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateInput = () => {
    setError('');
    
    // ✅ CRITICAL: Check authentication first
    if (!isAuthenticated || !userId) {
      setError('Please sign in to analyze content');
      toast.error('Authentication required', {
        description: 'Please sign in to use the analysis feature'
      });
      return false;
    }
    
    if (activeTab === 'url' && !urlInput.trim()) {
      setError('Please enter a valid URL');
      return false;
    }
    
    if (activeTab === 'url' && !isValidUrl(urlInput)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return false;
    }
    
    if (activeTab === 'text' && !textInput.trim()) {
      setError('Please enter some text to analyze');
      return false;
    }
    
    if (activeTab === 'text' && textInput.trim().length < 50) {
      setError('Text must be at least 50 characters long');
      return false;
    }
    
    if (activeTab === 'file' && !selectedFile) {
      setError('Please select a file to analyze');
      return false;
    }
    
    return true;
  };

  // ✅ Handle URL analysis with Auth Headers
  const handleUrlAnalysis = async () => {
    if (!validateInput()) return;

    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔗 Sending URL to backend:', API_BASE_URL);
      console.log('👤 User ID:', userId);
      
      const endpoint = `${API_BASE_URL}/api/analyze/summary`;
      
      console.log('📡 Full endpoint:', endpoint);
      console.log('📝 Request payload:', { url: urlInput });

      // ✅ CRITICAL: Include x-user-id header
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          'x-user-id': userId as string
        },
        body: JSON.stringify({
          url: urlInput,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please sign in again'
          });
          // Optional: redirect to login
          // navigate('/login');
          return;
        }
        
        if (response.status === 402) {
          toast.error('Insufficient credits', {
            description: 'Please upgrade your plan or purchase more credits'
          });
          throw new Error('Insufficient credits. Please upgrade your plan.');
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);

      toast.success('Analysis complete!', {
        description: 'Your news article has been analyzed successfully.'
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      // Navigate to results page with data
      navigate('/results', { state: { analysisData: data } });

    } catch (err) {
      console.error('❌ Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error('Analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle file analysis with Auth Headers
  const handleFileAnalysis = async () => {
    if (!validateInput() || !selectedFile) return;

    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('📄 Uploading file:', selectedFile.name);
      console.log('👤 User ID:', userId);
      console.log('🔗 Backend URL:', API_BASE_URL);

      const endpoint = `${API_BASE_URL}/api/analyze/file`;
      
      // ✅ CRITICAL: Include x-user-id header
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          'x-user-id': userId as string
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please sign in again'
          });
          return;
        }
        
        if (response.status === 402) {
          toast.error('Insufficient credits', {
            description: 'Please upgrade your plan or purchase more credits'
          });
          throw new Error('Insufficient credits. Please upgrade your plan.');
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ File analysis complete:', data);

      toast.success('File analyzed successfully!');

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      navigate('/results', { state: { analysisData: data } });

    } catch (err) {
      console.error('❌ File analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze file';
      setError(errorMessage);
      toast.error('File analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle text analysis with Auth Headers
  const handleTextAnalysis = async () => {
    if (!validateInput()) return;

    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Analyzing text...');
      console.log('👤 User ID:', userId);
      console.log('🔗 Backend URL:', API_BASE_URL);

      const endpoint = `${API_BASE_URL}/api/analyze/summary`;

      // ✅ CRITICAL: Include x-user-id header
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
          'x-user-id': userId as string
        },
        body: JSON.stringify({
          text: textInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 401) {
          toast.error('Authentication failed', {
            description: 'Please sign in again'
          });
          return;
        }
        
        if (response.status === 402) {
          toast.error('Insufficient credits', {
            description: 'Please upgrade your plan or purchase more credits'
          });
          throw new Error('Insufficient credits. Please upgrade your plan.');
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Text analysis complete:', data);

      toast.success('Text analyzed successfully!');

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      navigate('/results', { state: { analysisData: data } });

    } catch (err) {
      console.error('❌ Text analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text';
      setError(errorMessage);
      toast.error('Text analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a PDF, DOCX, or TXT file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a PDF, DOCX, or TXT file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleAnalyze = () => {
    switch (activeTab) {
      case 'url':
        handleUrlAnalysis();
        break;
      case 'file':
        handleFileAnalysis();
        break;
      case 'text':
        handleTextAnalysis();
        break;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">News Analysis</h2>
                <p className="text-blue-100 text-sm">AI-powered insights from any news source</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isAuthenticated ? 'Authenticated' : 'Sign In Required'}
              </span>
            </div>
          </div>
          
          {/* ✅ Auth status warning */}
          {!isAuthenticated && (
            <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3 mt-4">
              <p className="text-yellow-100 text-sm">
                ⚠️ Please sign in to use the analysis feature
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <LinkIcon className="w-4 h-4" />
                <span>URL</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'file'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>File Upload</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'text'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Type className="w-4 h-4" />
                <span>Direct Text</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Article URL
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || !isAuthenticated}
                />
              </div>
            </div>
          )}

          {activeTab === 'file' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading || !isAuthenticated}
              />
              
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                    disabled={isLoading || !isAuthenticated}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      disabled={isLoading || !isAuthenticated}
                    >
                      Click to upload
                    </button>
                    <span className="text-gray-600"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, or TXT (max 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Text
                </label>
                <textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your article text here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading || !isAuthenticated}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {textInput.length} characters (minimum 50 required)
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !isAuthenticated}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  <span>{isAuthenticated ? 'Analyze Article' : 'Sign In to Analyze'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
