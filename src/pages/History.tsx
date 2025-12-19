import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, RefreshCw, Calendar, FileText, ChevronLeft, ChevronRight,
  TrendingUp, Building, Globe, Shield, Target, BarChart
} from 'lucide-react';
import { historyAPI, AnalysisHistory } from '@/services/historyAPI';

export type { AnalysisHistory, HistoryResponse } from '@/services/historyAPI';

export default function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await historyAPI.getHistory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      setAnalyses(response.analyses);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load analysis history. Please try again.');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, sortBy, sortOrder, currentPage, fetchHistory]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await historyAPI.refreshHistory();
      setAnalyses(response.analyses);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to refresh history. Please try again.');
      console.error('Error refreshing history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisClick = (id: string) => {
    navigate(`/analysis/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ FIXED: Use Lucide icons instead of broken emojis
  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'market-impact':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'party-impact':
        return <Building className="w-5 h-5 text-blue-600" />;
      case 'pestle':
        return <Globe className="w-5 h-5 text-purple-600" />;
      case 'manipulation-score':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'motive':
        return <Target className="w-5 h-5 text-orange-600" />;
      default:
        return <BarChart className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAnalysisIconBg = (type: string) => {
    switch (type) {
      case 'market-impact':
        return 'bg-green-100';
      case 'party-impact':
        return 'bg-blue-100';
      case 'pestle':
        return 'bg-purple-100';
      case 'manipulation-score':
        return 'bg-red-100';
      case 'motive':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 dark:text-slate-100">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900/60 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
                View and manage your previous analyses
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8 backdrop-blur-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-slate-300">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Loading analysis history...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchHistory}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-500 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analysis List */}
        {!loading && !error && (
          <>
            <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-lg">
              {analyses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search terms' : 'No analyses have been performed yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => handleAnalysisClick(analysis.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAnalysisClick(analysis.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open analysis: ${analysis.title}`}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors duration-200"
                      title="View analysis report"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 ${getAnalysisIconBg(analysis.type)} rounded-lg flex items-center justify-center`}>
                              {getAnalysisIcon(analysis.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                                {analysis.title}
                              </h3>
                              {analysis.metrics && (
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                    Score: {analysis.metrics.score}%
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    Confidence: {analysis.metrics.confidence}%
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAnalysisClick(analysis.id);
                                    }}
                                    aria-label="View report"
                                    className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                  >
                                    View Report
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300 line-clamp-2">
                              {analysis.summary}
                            </p>
                            <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-slate-400">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(analysis.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
