import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Plus, Calendar, FileText } from 'lucide-react';

interface Portfolio {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  analysisCount: number;
}

interface SavedPortfoliosProps {
  userId: string;
}

const SavedPortfolios = ({ userId }: SavedPortfoliosProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, [userId]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/account/portfolios?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch portfolios');
      
      const data = await response.json();
      setPortfolios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/account/portfolios/${portfolioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete portfolio');
      
      // Remove from local state
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete portfolio. Please try again.');
    }
  };

  const handleViewPortfolio = (portfolioId: string) => {
    // Navigate to portfolio detail page
    window.location.href = `/portfolio/${portfolioId}`;
  };

  const handleEditPortfolio = (portfolioId: string) => {
    // Navigate to portfolio edit page
    window.location.href = `/portfolio/${portfolioId}/edit`;
  };

  // Pagination logic
  const totalPages = Math.ceil(portfolios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPortfolios = portfolios.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchPortfolios}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved portfolios</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You haven't saved any portfolios yet. Start analyzing to save your work!
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Start Analyzing</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPortfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
              {portfolio.thumbnail ? (
                <img
                  src={portfolio.thumbnail}
                  alt={portfolio.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {portfolio.analysisCount} analyses
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {portfolio.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {portfolio.description}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mb-4">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(portfolio.updatedAt).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewPortfolio(portfolio.id)}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEditPortfolio(portfolio.id)}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(portfolio.id)}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, portfolios.length)} of {portfolios.length} portfolios
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm border rounded transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Portfolio</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this portfolio? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePortfolio(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPortfolios;