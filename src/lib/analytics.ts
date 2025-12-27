export function initHotjar() {
  const id = import.meta.env.VITE_HOTJAR_ID;
  const sv = import.meta.env.VITE_HOTJAR_SV || '6';
  if (!id || typeof window === 'undefined') return;
  if (document.getElementById('hj-script')) return;
  const s = document.createElement('script');
  s.id = 'hj-script';
  s.defer = true;
  s.innerHTML = `
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:${Number(id)},hjsv:${Number(sv)}};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  `;
  document.head.appendChild(s);
}
