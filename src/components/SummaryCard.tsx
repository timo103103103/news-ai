import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Calendar, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface PestleDataPoint {
  name: string;
  value: number;
  color: string;
}

interface SummaryCardProps {
  title?: string;
  duration?: string;
  date?: string;
  accuracy?: number;
  dataPoints?: number;
  pestleData?: PestleDataPoint[]; // ✅ Accept real PESTLE data
  className?: string;
  onViewFullReport?: () => void;
}

// Fallback data - only used if no real data provided
const defaultPestleData: PestleDataPoint[] = [
  { name: 'Political', value: 0, color: '#3B82F6' },
  { name: 'Economic', value: 0, color: '#10B981' },
  { name: 'Social', value: 0, color: '#F59E0B' },
  { name: 'Tech', value: 0, color: '#8B5CF6' },
  { name: 'Legal', value: 0, color: '#EF4444' },
  { name: 'Environmental', value: 0, color: '#06B6D4' }
];

export default function EnhancedSummaryCard({
  title = "Market Analysis Report",
  duration = "2.3 minutes",
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  accuracy = 0,
  dataPoints = 0,
  pestleData, // ✅ Real data from props
  className = "",
  onViewFullReport
}: SummaryCardProps) {
  const { tier } = useSubscription();
  
  // ✅ Use real data if provided, otherwise use defaults
  const chartData = pestleData && pestleData.length > 0 ? pestleData : defaultPestleData;
  
  // Calculate stats from real data
  const averageScore = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)
    : 0;
  
  const highestFactor = chartData.length > 0
    ? chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0])
    : { name: 'N/A', value: 0 };
  
  const lowestFactor = chartData.length > 0
    ? chartData.reduce((min, item) => item.value < min.value ? item : min, chartData[0])
    : { name: 'N/A', value: 0 };
  
  const getTierColor = () => {
    switch (tier) {
      case 'premium': return 'from-purple-500 to-pink-500';
      case 'monthly': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierBadge = () => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'monthly': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  // Show message if no real data
  const hasRealData = pestleData && pestleData.length > 0 && pestleData.some(d => d.value > 0);

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      {/* Premium Header */}
      <div className={`bg-gradient-to-r ${getTierColor()} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Completed</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTierBadge()}`}>
              {tier.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Accuracy</span>
            </div>
            <div className="text-2xl font-bold">{accuracy}%</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Data Points</span>
            </div>
            <div className="text-2xl font-bold">{dataPoints}</div>
          </div>
        </div>
      </div>

      {/* Analysis Overview */}
      <div className="p-6">
        {!hasRealData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ PESTLE analysis data not available. This chart will populate with real analysis results.
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            PESTLE Analysis Overview
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Details */}
        {hasRealData && (
          <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{averageScore}</div>
              <div className="text-xs text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{highestFactor.value}%</div>
              <div className="text-xs text-gray-600">Highest ({highestFactor.name})</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{lowestFactor.value}%</div>
              <div className="text-xs text-gray-600">Lowest ({lowestFactor.name})</div>
            </div>
          </div>
        )}

        {/* Analysis Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
        </div>

        {/* Action Button */}
        {onViewFullReport && (
          <button 
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            onClick={onViewFullReport}
          >
            <span>View Full Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
