import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Link as LinkIcon, FileText, AlertCircle, CheckCircle, Loader2, 
  ArrowLeft, FileUp, Type, Shield, Zap, Target, BarChart3, Lock,
  ChevronRight, BrainCircuit, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import SummaryCard from '../components/SummaryCard'; // Keep for structure if needed, or replace with inline preview
import DailyIntelligenceSignup from '../components/DailyIntelligenceSignup';

// ✅ Supabase Client Setup
const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials!');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

const supabase = getSupabaseClient();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://news-backend-production-ba81.up.railway.app';

const NewsAnalysis = () => {
  const navigate = useNavigate();
  // State
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_TEXT_LENGTH = 10000;
  const ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.txt', '.doc'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // ✅ Auth Check
  useEffect(() => {
    checkAuth();
    if (!supabase) return;
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    if (!supabase) {
      setError('System configuration error: Auth unavailable.');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  // ✅ Validation Logic
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      return { valid: false, error: 'Unsupported format. PDF, DOC, DOCX, or TXT only.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  };

  // ✅ Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file?: File) => {
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Validation failed');
        toast.error(validation.error);
        return;
      }
      setSelectedFile(file);
      setError('');
      toast.success('File attached successfully');
      
      // Simulate processing visual
      setFileProcessing(true);
      setTimeout(() => setFileProcessing(false), 800);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFile(files[0]);
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUrlInput(v);
    if (!v.trim()) { setUrlValid(null); return; }
    setUrlValid(validateUrl(v));
  };

  // ✅ API Submission
  const handleSubmit = async () => {
    setError('');

    if (!isAuthenticated || !userId) {
      toast.error('Authentication Required', {
        description: 'Please sign in to access the Intelligence Protocol.'
      });
      return;
    }

    let requestBody: { text?: string; url?: string } = {};

    if (activeTab === 'url') {
      if (!urlInput.trim() || !validateUrl(urlInput)) {
        setError('Please enter a valid URL protocol (https://)');
        return;
      }
      requestBody.url = urlInput.trim();
    } else if (activeTab === 'file') {
      if (!selectedFile) { setError('Please upload a document'); return; }
      try {
        const fileContent = await selectedFile.text();
        requestBody.text = `Document: ${selectedFile.name}\n\n${fileContent}`;
      } catch {
        requestBody.text = `Analyze this document: ${selectedFile.name}`;
      }
    } else if (activeTab === 'text') {
      if (!textInput.trim()) { setError('Please enter text content'); return; }
      requestBody.text = textInput.trim();
    }

    setIsLoading(true);

    try {
      const apiUrl = `${API_BASE_URL}/api/analyze/summary`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId 
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 402) throw new Error('Credit limit reached. Please upgrade plan.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Try again shortly.');
        throw new Error('Analysis service unavailable.');
      }

      const data = await response.json();
      const analysisData = data.data;

      // Construct Result Object
      const analysisResult = {
        rawAnalysis: analysisData,
        sourceType: activeTab,
        sourceText: requestBody.text || requestBody.url || '',
        timestamp: new Date().toISOString(),
        userId: userId,
        // Fallbacks for specific visualizations
        summary: analysisData.summary || { title: "Intelligence Report" },
        pestle: analysisData.pestle,
        motive: analysisData.motive,
        party: analysisData.partyImpact,
        stock: analysisData.marketImpact,
        manipulation: analysisData.credibility,
      };

      sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
      toast.success('Intelligence Protocol Complete');
      navigate('/results');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed');
      toast.error(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* 🔙 Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <div className="p-1 rounded-full bg-white border border-slate-200 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* 🚀 Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-6">
            <Sparkles size={12} />
            AI Intelligence Protocol V2.0
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Decode the Narrative. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Predict the Impact.
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Upload any article, document, or URL. Our AI extracts hidden motives, 
            market signals, and PESTLE risks in seconds.
          </p>
        </div>

        {/* 🎛️ Command Center (Main Card) */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative z-10">
          
          {/* Tabs / Input Method Toggle */}
          <div className="bg-slate-50/50 border-b border-slate-200 p-2">
            <div className="flex p-1 bg-slate-200/50 rounded-xl">
              {[
                { id: 'url', label: 'News URL', icon: LinkIcon },
                { id: 'file', label: 'Document Upload', icon: FileUp },
                { id: 'text', label: 'Raw Text', icon: Type }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-8 md:p-12">
            
            {/* URL Input */}
            {activeTab === 'url' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Target Source</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    className={`block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 transition-all font-mono text-sm ${
                      urlValid === false ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    placeholder="https://bloomberg.com/articles/market-shift..."
                    value={urlInput}
                    onChange={handleUrlChange}
                    disabled={isLoading}
                  />
                  {urlValid && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <Lock size={12} /> Supports paywalled analysis sites & standard news outlets.
                </p>
              </div>
            )}

            {/* File Upload */}
            {activeTab === 'file' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Upload Intelligence Asset</label>
                <div
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : selectedFile 
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                  
                  {fileProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                      <p className="text-indigo-900 font-semibold">Scanning document structure...</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <FileText size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{selectedFile.name}</h3>
                      <p className="text-sm text-emerald-600 font-medium mb-4">Ready for analysis</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-xs text-slate-400 hover:text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Upload size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Drop document here, or click to browse
                      </h3>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        Supports PDF, DOCX, and TXT reports (Max 10MB).
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Text Input */}
            {activeTab === 'text' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Raw Intelligence Data</label>
                <div className="relative">
                  <textarea
                    ref={textAreaRef}
                    className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm min-h-[200px] resize-y"
                    placeholder="Paste article text, press releases, or earnings call transcripts here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    maxLength={MAX_TEXT_LENGTH}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-mono">
                    {textInput.length}/{MAX_TEXT_LENGTH}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}

            {/* Auth Warning */}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Authentication Required</h4>
                  <p className="text-sm text-amber-700">You must be logged in to run the analysis protocol.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !isAuthenticated}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] ${
                  isLoading || !isAuthenticated
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Running Intelligence Protocol...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={20} />
                    Run Analysis
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                By analyzing, you agree to our Terms of Service. Data is encrypted in transit.
              </p>
            </div>

          </div>
        </div>

        {/* 📊 Feature Teaser Grid (Social Proof/Value Add) */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Institutional Speed</h3>
            <p className="text-sm text-slate-600">
              Get comprehensive summaries, key takeaways, and entity extraction in under 30 seconds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Market Impact</h3>
            <p className="text-sm text-slate-600">
              Identify Bull/Bear signals for specific tickers and sectors based on sentiment analysis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Bias & Motive</h3>
            <p className="text-sm text-slate-600">
              Detect hidden political agendas, manipulation tactics, and source credibility scores.
            </p>
          </div>
        </div>

        {/* 👇 Secondary Signup CTA */}
        <div className="mt-16">
          <DailyIntelligenceSignup />
        </div>

      </div>
    </div>
  );
};

// Simple Icon component for the header
function Sparkles({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export default NewsAnalysis;