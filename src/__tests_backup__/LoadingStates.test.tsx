import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState, ErrorState, EmptyState, SuccessState } from '../components/LoadingStates';

describe('LoadingStates', () => {
  describe('LoadingState', () => {
    it('should render with default message', () => {
      render(<LoadingState />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<LoadingState message="Fetching analysis data..." />);
      
      expect(screen.getByText('Fetching analysis data...')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(<LoadingState size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6');

      rerender(<LoadingState size="md" />);
      expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');

      rerender(<LoadingState size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12');
    });

    it('should apply custom className', () => {
      render(<LoadingState className="custom-class" />);
      
      expect(screen.getByRole('status').parentElement).toHaveClass('custom-class');
    });
  });

  describe('ErrorState', () => {
    it('should render with default props', () => {
      render(<ErrorState />);
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Please try again later')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      render(
        <ErrorState 
          title="API Error"
          message="Failed to load analysis data"
        />
      );
      
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load analysis data')).toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      const mockRetry = vi.fn();
      render(<ErrorState onRetry={mockRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should apply custom className', () => {
      render(<ErrorState className="custom-error" />);
      
      expect(screen.getByText('Something went wrong').parentElement).toHaveClass('custom-error');
    });

    it('should render error icon', () => {
      render(<ErrorState />);
      
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('bg-red-100');
    });
  });

  describe('EmptyState', () => {
    it('should render with default props', () => {
      render(<EmptyState />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('There is no data to display at the moment')).toBeInTheDocument();
      expect(screen.queryByTestId('action')).not.toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      render(
        <EmptyState 
          title="No Analysis Results"
          message="Start by uploading your first document"
        />
      );
      
      expect(screen.getByText('No Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Start by uploading your first document')).toBeInTheDocument();
    });

    it('should render with custom icon', () => {
      const CustomIcon = () => <div data-testid="custom-icon">📊</div>;
      render(<EmptyState icon={<CustomIcon />} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render with action button', () => {
      const actionButton = <button data-testid="action">Upload Document</button>;
      render(<EmptyState action={actionButton} />);
      
      expect(screen.getByTestId('action')).toBeInTheDocument();
      expect(screen.getByText('Upload Document')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<EmptyState className="custom-empty" />);
      
      expect(screen.getByText('No data available').parentElement).toHaveClass('custom-empty');
    });
  });

  describe('SuccessState', () => {
    it('should render with default props', () => {
      render(<SuccessState />);
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('should render with custom title and message', () => {
      render(
        <SuccessState 
          title="Analysis Complete"
          message="Your document has been successfully analyzed"
        />
      );
      
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
      expect(screen.getByText('Your document has been successfully analyzed')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<SuccessState className="custom-success" />);
      
      expect(screen.getByText('Success!').parentElement).toHaveClass('custom-success');
    });

    it('should render success icon', () => {
      render(<SuccessState />);
      
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('bg-green-100');
    });
  });
});