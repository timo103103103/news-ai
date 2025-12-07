import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, FileText, AlertCircle, Loader2, ArrowLeft, Type, BarChart3, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://news-ai-production-f7d7.up.railway.app';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_TEXT_LENGTH = 10000;
  const ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.txt', '.doc'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Validation Functions
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      return { 
        valid: false, 
        error: 'Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files only.' 
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  };

  // File Handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'File validation failed');
        setSelectedFile(null);
        toast.error(validation.error || 'File validation failed');
        return;
      }
      setSelectedFile(file);
      setError('');
      toast.success(`File "${file.name}" selected successfully`);
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
    if (files.length > 0) {
      const file = files[0];
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'File validation failed');
        toast.error(validation.error || 'File validation failed');
        return;
      }
      setSelectedFile(file);
      setError('');
      toast.success(`File "${file.name}" selected successfully`);
    }
  }, []);

  // Analysis Submission
  const handleAnalyze = async () => {
    setError('');
    setIsLoading(true);
    setUploadProgress(0);

    try {
      let requestBody: any = {};
      let endpoint = `${API_BASE_URL}/api/analyze/summary`; // ✅ Full URL to Railway

      console.log('🔗 Sending URL to backend:', API_BASE_URL);
      console.log('🚀 Sending to backend:', endpoint);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Prepare request based on input type
      if (activeTab === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter a URL');
        }
        if (!validateUrl(urlInput)) {
          throw new Error('Please enter a valid URL starting with http:// or https://');
        }
        requestBody = { url: urlInput.trim() };
      } else if (activeTab === 'text') {
        if (!textInput.trim()) {
          throw new Error('Please enter some text to analyze');
        }
        if (textInput.length > MAX_TEXT_LENGTH) {
          throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
        }
        requestBody = { text: textInput.trim() };
      } else if (activeTab === 'file') {
        if (!selectedFile) {
          throw new Error('Please select a file to analyze');
        }
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch(`${API_BASE_URL}/api/analyze/file`, {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        handleAnalysisSuccess(data);
        return;
      }

      // For URL and text analysis
      console.log('📝 Request body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      handleAnalysisSuccess(data);

    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Failed to analyze content. Please try again.');
      toast.error('Analysis failed', {
        description: err.message || 'Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleAnalysisSuccess = (data: any) => {
    console.log('✅ Analysis successful:', data);
    
    sessionStorage.setItem('analysisResult', JSON.stringify({
      rawAnalysis: data.data,
      timestamp: new Date().toISOString(),
      sourceType: activeTab,
    }));

    console.log('💾 Saved to sessionStorage');

    toast.success('Analysis complete!', {
      description: 'Redirecting to results...'
    });

    if (onAnalysisComplete) {
      onAnalysisComplete(data);
    } else {
      setTimeout(() => navigate('/analysis-result'), 500);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setTextInput('');
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered News Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Analyze news articles, documents, or text for credibility, bias, and impact
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span>URL</span>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'file'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Type className="w-5 h-5" />
              <span>Text Input</span>
            </button>
          </div>

          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* URL Input Tab */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the full URL of any news article or web page
                  </p>
                </div>
              </div>
            )}

            {/* File Upload Tab */}
            {activeTab === 'file' && (
              <div className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    {selectedFile ? selectedFile.name : 'Drop your file here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {/* Text Input Tab */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paste Article Text
                  </label>
                  <textarea
                    ref={textAreaRef}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your article text here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      {textInput.length} / {MAX_TEXT_LENGTH} characters
                    </p>
                    {textInput.length > MAX_TEXT_LENGTH && (
                      <p className="text-sm text-red-600 font-medium">
                        Text exceeds maximum length
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Now'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Progress Bar */}
            {isLoading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Analysis</h3>
            <p className="text-sm text-gray-600">
              Get detailed insights including summary, credibility score, and market impact
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <BarChart3 className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">PESTLE Framework</h3>
            <p className="text-sm text-gray-600">
              Understand political, economic, social, technological, legal, and environmental factors
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <ShieldCheck className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Advanced AI models analyze content for accuracy, bias, and hidden motives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
