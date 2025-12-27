export function getUxVariant(userId?: string): 'accordion' | 'tabs' {
  const envVar = (import.meta.env.VITE_UX_VARIANT as string) || '';
  if (envVar === 'accordion' || envVar === 'tabs') return envVar as any;
  if (!userId) return 'accordion';
  const hash = Array.from(userId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'accordion' : 'tabs';
}
