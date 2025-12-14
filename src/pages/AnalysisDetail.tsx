import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, RefreshCw } from 'lucide-react';
import { historyAPI, AnalysisDetail as AnalysisDetailType } from '@/services/historyAPI';

// Re-export the interface from API service
export type { AnalysisDetail } from '@/services/historyAPI';

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - replace with actual API call

  const fetchAnalysisDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) {
        throw new Error('Analysis ID is required');
      }
      
      const analysisData = await historyAPI.getAnalysisDetail(id);
      setAnalysis(analysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis details');
      console.error('Error fetching analysis detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAnalysisDetail();
    }
  }, [id, fetchAnalysisDetail]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'market-impact':
        return '📈';
      case 'party-impact':
        return '🏛️';
      case 'pestle':
        return '🌍';
      case 'manipulation-score':
        return '🔍';
      case 'motive':
        return '🎯';
      default:
        return '📊';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis details...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-400 rounded-full" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The analysis you\'re looking for could not be found.'}
          </p>
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900/60 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-1 inline" />
                {formatDate(analysis.date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 backdrop-blur-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl mr-4">
                  {getAnalysisIcon(analysis.type)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.title}</h1>
                  <p className="text-gray-600 dark:text-slate-300 mt-1">{analysis.summary}</p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Analysis</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  {analysis.content || 'Detailed analysis content will be displayed here. This section contains the comprehensive analysis results with detailed insights, findings, and recommendations based on the input data and analysis type.'}
                </p>
                
                {analysis.rawData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Key Findings</h3>
                    <div className="bg-gray-50 dark:bg-slate-900/40 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                        {JSON.stringify(analysis.rawData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Metrics Card */}
            <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 backdrop-blur-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Analysis Metrics</h3>
              {analysis.metrics && (
                <div className="space-y-4">
                  {analysis.metrics.score && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Overall Score</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{analysis.metrics.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${analysis.metrics.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {analysis.metrics.confidence && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Confidence Level</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{analysis.metrics.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${analysis.metrics.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analysis Factors */}
            {analysis.metrics?.factors && (
              <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Factors</h3>
                <div className="space-y-2">
                  {analysis.metrics.factors.map((factor, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Share Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
