type Props = {
  length?: number;
  theme?: 'blue' | 'cyan' | 'purple';
  direction?: 'vertical' | 'horizontal';
  fullWidth?: boolean;
  className?: string;
};

export default function CyberChain({ length = 64, theme = 'cyan', direction = 'vertical', fullWidth = false, className = '' }: Props) {
  const style = { ['--length' as any]: `${length}px`, ...(fullWidth ? { width: '100%' } : {}) } as React.CSSProperties;
  return (
    <div className={`cyber-chain cyber-${direction} cyber-${theme} ${fullWidth ? 'w-full' : ''} ${className}`} style={style}>
      <span className="chain-node start" />
      <span className="chain-line" />
      <span className="chain-node end" />
    </div>
  );
}
