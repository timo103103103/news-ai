// Analytics tracking function declarations for TypeScript
interface Window {
  trackCTAClick: (buttonName: string) => void;
  trackChartInteraction: (chartType: string, action: string) => void;
  trackPremiumView: (featureName: string) => void;
}