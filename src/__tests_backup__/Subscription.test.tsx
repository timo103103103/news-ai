import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubscriptionProvider, useSubscription } from '../contexts/SubscriptionContext';
import { TierLock, UpgradeBanner } from '../components/TierLock';

// Mock window tracking functions
vi.stubGlobal('trackCTAClick', vi.fn());
vi.stubGlobal('trackChartInteraction', vi.fn());
vi.stubGlobal('trackPremiumView', vi.fn());

const TestComponent = ({ feature }: { feature: string }) => {
  const { canAccess, getUpgradeMessage, getUpgradeCTA } = useSubscription();
  
  return (
    <div>
      <div data-testid="access">{canAccess(feature) ? 'true' : 'false'}</div>
      <div data-testid="message">{getUpgradeMessage(feature)}</div>
      <div data-testid="cta">{getUpgradeCTA(feature)}</div>
    </div>
  );
};

describe('SubscriptionContext', () => {
  it('should provide correct access for free tier', () => {
    render(
      <SubscriptionProvider initialTier="free">
        <TestComponent feature="summary" />
      </SubscriptionProvider>
    );
    
    expect(screen.getByTestId('access')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('Upgrade to unlock this feature');
  });

  it('should provide correct access for monthly tier', () => {
    render(
      <SubscriptionProvider initialTier="monthly">
        <TestComponent feature="motive_heatmap" />
      </SubscriptionProvider>
    );
    
    expect(screen.getByTestId('access')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('Upgrade to Monthly tier to unlock motive analysis');
  });

  it('should provide correct access for premium tier', () => {
    render(
      <SubscriptionProvider initialTier="premium">
        <TestComponent feature="manipulation_score" />
      </SubscriptionProvider>
    );
    
    expect(screen.getByTestId('access')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent('Go Premium for manipulation detection');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent feature="summary" />);
    }).toThrow('useSubscription must be used within a SubscriptionProvider');
    
    consoleSpy.mockRestore();
  });
});

describe('TierLock', () => {
  it('should render children when user has access', () => {
    render(
      <SubscriptionProvider initialTier="premium">
        <TierLock feature="manipulation_score">
          <div data-testid="protected-content">Protected Content</div>
        </TierLock>
      </SubscriptionProvider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
  });

  it('should show lock overlay when user does not have access', () => {
    render(
      <SubscriptionProvider initialTier="free">
        <TierLock feature="manipulation_score">
          <div data-testid="protected-content">Protected Content</div>
        </TierLock>
      </SubscriptionProvider>
    );
    
    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText('Go Premium for manipulation detection')).toBeInTheDocument();
    expect(screen.getByText('Go Premium for complete insights')).toBeInTheDocument();
  });

  it('should call tracking function on upgrade click', () => {
    render(
      <SubscriptionProvider initialTier="free">
        <TierLock feature="manipulation_score">
          <div>Protected Content</div>
        </TierLock>
      </SubscriptionProvider>
    );
    
    const upgradeButton = screen.getByText('Go Premium for complete insights');
    fireEvent.click(upgradeButton);
    
    expect(window.trackCTAClick).toHaveBeenCalledWith('upgrade_manipulation_score');
  });
});

describe('UpgradeBanner', () => {
  it('should render upgrade banner with correct messaging', () => {
    render(
      <SubscriptionProvider initialTier="free">
        <UpgradeBanner feature="pestle_full" targetTier="monthly" />
      </SubscriptionProvider>
    );
    
    expect(screen.getByText('Unlock More Insights')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Monthly tier for full PESTLE analysis')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to unlock full analysis')).toBeInTheDocument();
  });

  it('should call tracking function on banner click', () => {
    render(
      <SubscriptionProvider initialTier="free">
        <UpgradeBanner feature="pestle_full" targetTier="monthly" />
      </SubscriptionProvider>
    );
    
    const upgradeButton = screen.getByText('Upgrade to unlock full analysis');
    fireEvent.click(upgradeButton);
    
    expect(window.trackCTAClick).toHaveBeenCalledWith('upgrade_pestle_full_monthly');
  });
});