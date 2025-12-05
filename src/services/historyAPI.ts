import axios from 'axios';

export interface AnalysisHistory {
  id: string;
  title: string;
  date: string;
  summary: string;
  type: string;
  metrics?: {
    score?: number;
    confidence?: number;
  };
}

export interface HistoryResponse {
  analyses: AnalysisHistory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AnalysisDetail {
  id: string;
  title: string;
  date: string;
  type: string;
  content: string;
  summary: string;
  metrics?: {
    score?: number;
    confidence?: number;
    factors?: string[];
  };
  rawData?: Record<string, unknown>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const historyAPI = {
  async getHistory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
  }): Promise<HistoryResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`, {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw new Error('Failed to fetch analysis history');
    }
  },

  async getAnalysisDetail(id: string): Promise<AnalysisDetail> {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis detail:', error);
      throw new Error('Failed to fetch analysis details');
    }
  },

  async refreshHistory(): Promise<HistoryResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/history/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing history:', error);
      throw new Error('Failed to refresh history');
    }
  }
};