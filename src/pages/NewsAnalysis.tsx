import { supabase } from '../lib/supabase';
import useAuthStore from '@/stores/authStore';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Link as LinkIcon, FileText, AlertCircle, CheckCircle, Loader2, 
  ArrowLeft, FileUp, Type, Shield, Zap, Target, BarChart3, Lock,
  ChevronRight, BrainCircuit, Globe
} from 'lucide-react';
import InputPill from '../components/InputPill';
import { toast } from 'sonner';
import SummaryCard from '../components/SummaryCard';
import DailyIntelligenceSignup from '../components/DailyIntelligenceSignup';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005';

const NewsAnalysis = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
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
  const [scanCount, setScanCount] = useState(0);
  const DAILY_LIMIT_FREE = 1;
  
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
      console.log('🔐 Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        const key = `${session.user.id}:${new Date().toISOString().slice(0,10)}`;
        const stored = localStorage.getItem(`dailyScanCount:${key}`);
        setScanCount(stored ? parseInt(stored, 10) || 0 : 0);
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setScanCount(0);
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Initial auth check:', session?.user?.id, sessionError);
      if (session?.user) {
        setUserId(session.user.id);
        setIsAuthenticated(true);
        const key = `${session.user.id}:${new Date().toISOString().slice(0,10)}`;
        const stored = localStorage.getItem(`dailyScanCount:${key}`);
        setScanCount(stored ? parseInt(stored, 10) || 0 : 0);
      } else {
        setIsAuthenticated(false);
        setScanCount(0);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const isFreePlan = (authUser?.plan || 'free').toLowerCase() === 'free';
  const limitReached = isAuthenticated && isFreePlan && scanCount >= DAILY_LIMIT_FREE;
  const recordScan = (uid: string) => {
    const key = `${uid}:${new Date().toISOString().slice(0,10)}`;
    const next = Math.min(DAILY_LIMIT_FREE, (parseInt(localStorage.getItem(`dailyScanCount:${key}`) || '0', 10) || 0) + 1);
    localStorage.setItem(`dailyScanCount:${key}`, String(next));
    setScanCount(next);
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

  // ✅ API Submission - FIXED: No duplicate session calls
  const handleSubmit = async () => {
    try {
      setError('');

      if (!supabase) {
        setError('系統配置錯誤：Supabase 未初始化');
        toast.error('系統配置錯誤');
        return;
      }

      // ✅ Get session ONCE at the beginning
      const { data: { session }, error: sessionError } = 
        await supabase.auth.getSession();

      console.log('🔐 Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!session?.access_token,
        userId: session?.user?.id,
        error: sessionError
      });

      if (sessionError || !session || !session.access_token) {
        setError('請先登入再進行分析');
        toast.error('請先登入再進行分析');
        navigate('/login');
        return;
      }

      if (isFreePlan && scanCount >= DAILY_LIMIT_FREE) {
        setError('Daily limit reached for free accounts (1 per day).');
        toast.error('Daily limit reached (1/day). Upgrade for more.');
        return;
      }

      if (!session.user?.id) {
        setError('無法獲取用戶信息，請重新登入');
        toast.error('無法獲取用戶信息，請重新登入');
        navigate('/login');
        return;
      }

      // ✅ Build request body
      let requestBody: { text?: string; url?: string; userId?: string } = {
        userId: session.user.id
      };

      if (activeTab === 'url') {
        if (!urlInput.trim() || !validateUrl(urlInput)) {
          setError('請輸入有效的網址');
          return;
        }
        requestBody.url = urlInput.trim();
      } else if (activeTab === 'file') {
        if (!selectedFile) { 
          setError('請上傳文件'); 
          return; 
        }
        try {
          const fileContent = await selectedFile.text();
          requestBody.text = `Document: ${selectedFile.name}\n\n${fileContent}`;
        } catch {
          requestBody.text = `Analyze this document: ${selectedFile.name}`;
        }
      } else if (activeTab === 'text') {
        if (!textInput.trim()) { 
          setError('請輸入分析內容'); 
          return; 
        }
        requestBody.text = textInput.trim();
      }

      setIsLoading(true);

      // ✅ Try to register/sync user first (in case backend doesn't have them)
      try {
        await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            supabaseId: session.user.id,
            email: session.user.email,
          }),
        });
      } catch (registerError) {
        console.log('⚠️ User registration/sync failed (might already exist):', registerError);
      }

      console.log('📤 Sending request:', {
        url: `${API_BASE_URL}/api/analyze/summary`,
        hasToken: !!session.access_token,
        tokenPrefix: session.access_token.substring(0, 20) + '...',
        userId: session.user.id,
        requestBody
      });

      const apiUrl = `${API_BASE_URL}/api/analyze/summary`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Analysis service unavailable.';
        
        try {
          const errorData = await response.json();
          console.error('❌ API Error:', errorData);
          errorMessage = errorData?.error || errorData?.message || errorMessage;
        } catch (e) {
          console.error('❌ Failed to parse error response');
        }

        if (response.status === 401) {
          errorMessage = '後端無法驗證用戶。請聯繫管理員檢查後端配置。';
          toast.error(errorMessage, {
            description: `User ID: ${session.user.id}`,
            duration: 5000
          });
        } else if (response.status === 402) {
          errorMessage = 'Credit limit reached. Please upgrade plan.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Try again shortly.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Analysis response:', data);
      
      const analysisData = data.data;

      // Construct Result Object
sessionStorage.setItem(
  'analysisResult',
  JSON.stringify({
    ...analysisData,                 // ⭐ 核心：不改名，不重組
    sourceType: activeTab,
    sourceText: requestBody.text || requestBody.url || '',
    timestamp: new Date().toISOString(),
    userId: session.user.id,
  })
);

      if (isFreePlan && session.user?.id) recordScan(session.user.id);
      toast.success('Intelligence Protocol Complete');
      navigate('/results');

    } catch (err: any) {
      console.error('❌ Analyze error:', err);
      const errorMessage = err.message || '分析服務暫時無法使用';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-inter selection:bg-indigo-100 dark:selection:bg-neonCyan">
      
      {/* 🔙 Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <div className="p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 dark:group-hover:border-indigo-500 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* 🚀 Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Decode the Narrative. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Predict the Impact.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Upload any article, document, or URL. Our AI extracts hidden motives, 
            market signals, and PESTLE risks in seconds.
          </p>
        </div>

        {/* 🎛️ Command Center (Main Card) */}
        <div className="bg-white dark:bg-slate-900/70 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 backdrop-blur-lg">
          
          {/* Tabs / Input Method Toggle */}
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-2">
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
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
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-slate-200 dark:ring-slate-700' 
                      : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
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
                <InputPill
                  value={urlInput}
                  onChange={(v) => handleUrlChange({ target: { value: v } } as any)}
                  placeholder="Paste article URL to analyze..."
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  disabled={!isAuthenticated || limitReached}
                  isValid={!!urlValid}
                />
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Lock size={12} /> Supports paywalled analysis sites & standard news outlets.
                </p>
                {isAuthenticated && isFreePlan && (
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Daily limit: {scanCount}/{DAILY_LIMIT_FREE}</p>
                )}
              </div>
            )}

            {/* File Upload */}
            {activeTab === 'file' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Upload Intelligence Asset</label>
                <div
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                      : selectedFile 
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'
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
                      <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                      <p className="text-indigo-900 font-semibold">Scanning document structure...</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <FileText size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{selectedFile.name}</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-4">Ready for analysis</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-xs text-slate-400 hover:text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Upload size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        Drop document here, or click to browse
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
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
                    className="block w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-mono text-sm min-h-[200px] resize-y"
                    placeholder="Paste article text, press releases, or earnings call transcripts here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    maxLength={MAX_TEXT_LENGTH}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono">
                    {textInput.length}/{MAX_TEXT_LENGTH}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</div>
              </div>
            )}

            {/* Auth Warning */}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Authentication Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">You must be logged in to run the analysis protocol.</p>
                </div>
              </div>
            )}

            

            {/* Action Buttons */}
            <div className="mt-8">
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !isAuthenticated || limitReached}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] ${
                  isLoading || !isAuthenticated || limitReached
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
                  <>Run Analysis</>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                By analyzing, you agree to our Terms of Service. Data is encrypted in transit.
              </p>
            </div>

          </div>
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
