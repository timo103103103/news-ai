import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, AlertCircle, Loader2, Type, BarChart3, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../contexts/SubscriptionContext';

// ✅ API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AnalysisInputProps {
  onAnalysisComplete?: (data: any) => void;
}

// ✅ Safe UUID generator with fallback for older browsers/mobile
const generateAnalysisId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for browsers that don't support crypto.randomUUID()
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
};

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
  
  // ✅ v8.0 IDEMPOTENT QUOTA SYSTEM - CRITICAL REFS
  const analysisIdRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  // ✅ Get subscription data for quota checking
  const { tier, scansUsed, scansLimit } = useSubscription();

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
        console.log('❌ User not authenticated (Guest mode)');
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
        console.log('❌ User not authenticated (Guest mode)');
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
    
    // ✅ FIX #1: ALLOW GUEST USERS (removed forced authentication)
    // Guest users (userId = null) will use IP trial via backend
    // Only check quota for authenticated free users
    
    const FREE_LIMIT = 5;
    if (isAuthenticated && tier === 'free' && (scansUsed ?? 0) >= FREE_LIMIT) {
      setError(`Free plan limit reached (${FREE_LIMIT} analyses per month)`);
      toast.error('Free Plan Limit Reached', {
        description: `You've used all ${FREE_LIMIT} free analyses this month. Upgrade to continue!`,
        duration: 5000,
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/pricing')
        }
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

  // ✅ v8.0 - Handle URL analysis with analysisId (IDEMPOTENT)
  const handleUrlAnalysis = async (analysisId: string) => {
    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      inFlightRef.current = false;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔗 Sending URL to backend:', API_BASE_URL);
      console.log('🆔 Analysis ID:', analysisId);
      console.log('👤 User ID:', userId || 'Guest');
      
      const endpoint = `${API_BASE_URL}/api/analyze/summary`;
      
      console.log('📡 Full endpoint:', endpoint);
      console.log('📝 Request payload:', { analysisId, url: urlInput, userId });

      // ✅ Support both authenticated and guest users
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          analysisId,  // ⭐⭐⭐ CRITICAL: Idempotent quota key
          url: urlInput,
          userId: userId,  // ✅ null for guest, UUID for authenticated
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        
        // ✅ Handle backend error codes from server.js
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
        
        // ✅ FIX #3: Generic 403 handler (covers all quota/permission errors)
        if (response.status === 403) {
          const errorMessage = errorData.message || 'You have reached your analysis limit';
          toast.error('Access Denied', {
            description: errorMessage,
            action: {
              label: isAuthenticated ? 'Upgrade' : 'Sign Up',
              onClick: () => navigate(isAuthenticated ? '/pricing' : '/signup')
            }
          });
          throw new Error(errorMessage);
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (response.status === 500) {
          toast.error('Server Error', {
            description: errorData.message || 'An error occurred. Please try again.'
          });
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);
      console.log('💳 Quota consumed:', data.meta?.quotaConsumed);

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
      inFlightRef.current = false;  // ✅ CRITICAL: Release lock
    }
  };

  // ✅ v8.0 - Handle text analysis with analysisId (IDEMPOTENT)
  const handleTextAnalysis = async (analysisId: string) => {
    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      inFlightRef.current = false;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Sending text to backend:', API_BASE_URL);
      console.log('🆔 Analysis ID:', analysisId);
      console.log('👤 User ID:', userId || 'Guest');
      
      const endpoint = `${API_BASE_URL}/api/analyze/summary`;
      
      console.log('📡 Full endpoint:', endpoint);
      console.log('📝 Request payload (text length):', textInput.length);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          analysisId,  // ⭐⭐⭐ CRITICAL: Idempotent quota key
          text: textInput,
          userId: userId,  // ✅ null for guest, UUID for authenticated
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        
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
        
        // ✅ FIX #3: Generic 403 handler
        if (response.status === 403) {
          const errorMessage = errorData.message || 'You have reached your analysis limit';
          toast.error('Access Denied', {
            description: errorMessage,
            action: {
              label: isAuthenticated ? 'Upgrade' : 'Sign Up',
              onClick: () => navigate(isAuthenticated ? '/pricing' : '/signup')
            }
          });
          throw new Error(errorMessage);
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (response.status === 500) {
          toast.error('Server Error', {
            description: errorData.message || 'An error occurred. Please try again.'
          });
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);
      console.log('💳 Quota consumed:', data.meta?.quotaConsumed);

      toast.success('Analysis complete!', {
        description: 'Your text has been analyzed successfully.'
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

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
      inFlightRef.current = false;  // ✅ CRITICAL: Release lock
    }
  };

  // ✅ v8.0 - Handle file analysis with analysisId (IDEMPOTENT)
  // ✅ FIX #2: Changed to use /api/analyze/summary endpoint (same as URL/text)
  const handleFileAnalysis = async (analysisId: string) => {
    if (!API_BASE_URL) {
      toast.error('Configuration Error', {
        description: 'API endpoint not configured. Please check environment variables.'
      });
      inFlightRef.current = false;
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📎 Processing file for backend:', API_BASE_URL);
      console.log('🆔 Analysis ID:', analysisId);
      console.log('👤 User ID:', userId || 'Guest');
      
      // ✅ FIX #2: Use /api/analyze/summary endpoint (not /api/analyze/file)
      const endpoint = `${API_BASE_URL}/api/analyze/summary`;
      
      // Read file content as text
      const fileText = await selectedFile!.text();
      
      console.log('📡 Full endpoint:', endpoint);
      console.log('📝 File converted to text, length:', fileText.length);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          analysisId,  // ⭐⭐⭐ CRITICAL: Idempotent quota key
          text: fileText,  // ✅ Send file content as text
          userId: userId,  // ✅ null for guest, UUID for authenticated
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Error response:', errorData);
        
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
        
        // ✅ FIX #3: Generic 403 handler
        if (response.status === 403) {
          const errorMessage = errorData.message || 'You have reached your analysis limit';
          toast.error('Access Denied', {
            description: errorMessage,
            action: {
              label: isAuthenticated ? 'Upgrade' : 'Sign Up',
              onClick: () => navigate(isAuthenticated ? '/pricing' : '/signup')
            }
          });
          throw new Error(errorMessage);
        }
        
        if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: 'Please wait a moment before trying again'
          });
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        if (response.status === 500) {
          toast.error('Server Error', {
            description: errorData.message || 'An error occurred. Please try again.'
          });
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);
      console.log('💳 Quota consumed:', data.meta?.quotaConsumed);

      toast.success('Analysis complete!', {
        description: 'Your file has been analyzed successfully.'
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

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
      inFlightRef.current = false;  // ✅ CRITICAL: Release lock
    }
  };

  // ✅ v8.0: Main analyze handler with validation BEFORE setting inFlight
  const handleAnalyze = () => {
    // ✅ CRITICAL: Prevent duplicate requests
    if (inFlightRef.current) {
      console.warn('⚠️ Duplicate analyze request prevented (already in flight)');
      toast.warning('Analysis in progress', {
        description: 'Please wait for the current analysis to complete'
      });
      return;
    }

    // ✅ Validate BEFORE setting inFlight (prevents lock on validation failure)
    if (!validateInput()) {
      console.log('❌ Validation failed, not setting inFlight');
      return;  // Don't set inFlightRef if validation fails
    }

    // ✅ CRITICAL: Generate or reuse analysisId
    if (!analysisIdRef.current) {
      analysisIdRef.current = generateAnalysisId();
      console.log('🆕 Generated new analysisId:', analysisIdRef.current);
    } else {
      console.log('🔁 Reusing existing analysisId:', analysisIdRef.current);
    }

    // ✅ CRITICAL: Set in-flight lock AFTER validation passes
    inFlightRef.current = true;

    // Route to appropriate handler with analysisId
    switch (activeTab) {
      case 'url':
        handleUrlAnalysis(analysisIdRef.current);
        break;
      case 'file':
        handleFileAnalysis(analysisIdRef.current);
        break;
      case 'text':
        handleTextAnalysis(analysisIdRef.current);
        break;
    }
  };

  // File handling functions
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        toast.error('File too large', {
          description: 'Please select a file smaller than 10MB'
        });
        return;
      }

      // Validate file type (only text-readable files)
      const validTypes = ['.txt', '.md'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        setError('Invalid file type. Please upload TXT or MD files only.');
        toast.error('Invalid file type', {
          description: 'Please upload TXT or MD files only (PDF/DOCX require backend parsing)'
        });
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // ✅ v8.0: Reset analysisId when file changes (only if not in flight)
      if (!inFlightRef.current) {
        analysisIdRef.current = null;
      }
      
      toast.success('File selected', {
        description: `${file.name} is ready for analysis`
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const event = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(event);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // ✅ v8.0: Reset analysisId only when NOT in flight
  useEffect(() => {
    if (!inFlightRef.current) {
      analysisIdRef.current = null;
      console.log('🔄 Input changed, reset analysisId (not in flight)');
    } else {
      console.log('⚠️ Input changed but analysis in flight, keeping analysisId');
    }
  }, [urlInput, textInput]);

  // ✅ Calculate remaining analyses for display
  const FREE_LIMIT = 5;
  const IP_TRIAL_LIMIT = 2;
  
  // For authenticated users
  const remainingAnalyses = isAuthenticated && tier === 'free' 
    ? Math.max(0, FREE_LIMIT - (scansUsed ?? 0)) 
    : isAuthenticated && scansLimit && scansUsed !== undefined 
      ? Math.max(0, scansLimit - scansUsed)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
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
                  {isAuthenticated ? 'Authenticated' : 'Guest Mode'}
                </span>
              </div>
            </div>
            
            {/* ✅ FIX #1: Updated messaging for guest users */}
            {!isAuthenticated && (
              <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-3 mt-4">
                <p className="text-blue-100 text-sm">
                  🎁 Guest Mode: Try {IP_TRIAL_LIMIT} free analyses. Sign up for {FREE_LIMIT} monthly analyses!
                </p>
              </div>
            )}

            {/* ✅ Quota display for authenticated users */}
            {isAuthenticated && tier === 'free' && remainingAnalyses !== null && (
              <div className={`border rounded-lg p-3 mt-4 ${
                remainingAnalyses > 0 
                  ? 'bg-blue-500/20 border-blue-300/30' 
                  : 'bg-red-500/20 border-red-300/30'
              }`}>
                <p className={`text-sm font-medium ${
                  remainingAnalyses > 0 ? 'text-blue-100' : 'text-red-100'
                }`}>
                  {remainingAnalyses > 0 
                    ? `📊 Free Plan: ${remainingAnalyses} of ${FREE_LIMIT} analyses remaining this month`
                    : `⚠️ Free Plan limit reached (${FREE_LIMIT}/${FREE_LIMIT} used). Upgrade to continue!`
                  }
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
                    disabled={isLoading}
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
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
                      >
                        Click to upload
                      </button>
                      <span className="text-gray-600"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      TXT or MD files only (max 10MB)
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
                    disabled={isLoading}
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
                disabled={isLoading || (isAuthenticated && tier === 'free' && remainingAnalyses === 0)}
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
                    <span>
                      {isAuthenticated && tier === 'free' && remainingAnalyses === 0
                        ? 'Upgrade to Continue'
                        : 'Analyze Article'
                      }
                    </span>
                  </>
                )}
              </button>

              {/* ✅ Quota display under button */}
              {isAuthenticated && remainingAnalyses !== null && (
                <p className="mt-3 text-xs text-center text-slate-500">
                  {tier === 'free' 
                    ? `Free Plan: ${remainingAnalyses} / ${FREE_LIMIT} analyses left this month`
                    : scansLimit 
                      ? `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan: ${remainingAnalyses} / ${scansLimit} analyses left`
                      : null
                  }
                </p>
              )}
              
              {/* ✅ FIX #1: Guest user info */}
              {!isAuthenticated && (
                <p className="mt-3 text-xs text-center text-slate-500">
                  Guest Mode: {IP_TRIAL_LIMIT} free tries • <button onClick={() => navigate('/signup')} className="text-blue-600 hover:underline">Sign up</button> for {FREE_LIMIT}/month
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}