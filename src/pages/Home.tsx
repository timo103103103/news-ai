import { Helmet } from "react-helmet-async";
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "NexVeris",
      url: "https://www.nexverisai.com",
      logo: "https://zgiwqbpalykrztvvekcg.supabase.co/storage/v1/object/public/Nex/NexV%20Logo.png",
      sameAs: [
        "https://www.linkedin.com/",
        "https://twitter.com/"
      ]
    })}
  </script>
</Helmet>

import { useState } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Link as LinkIcon,
  Globe,
  Target,
  Loader2,
  AlertTriangle,
  Scale,
  Search,
  LineChart,
  Star,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import CyberChain from '../components/CyberChain';

export default function Home() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005';

  const handleAnalyzeNews = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setError('');
      if (!urlInput.trim()) {
        setError('Please enter a valid URL');
        toast.error('Please enter a valid URL');
        return;
      }
      try { new URL(urlInput.trim()); } catch { 
        setError('Please enter a valid URL');
        toast.error('Please enter a valid URL');
        return; 
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.access_token || !session.user?.id) {
        toast.error('Please log in to analyze');
        navigate('/login');
        return;
      }

      setIsLoading(true);

      try {
        await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            supabaseId: session.user.id,
            email: session.user.email,
          }),
        });
      } catch {}

      const response = await fetch(`${API_BASE_URL}/api/analyze/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: urlInput.trim(), userId: session.user.id }),
      });

      if (!response.ok) {
        let errorMessage = 'Analysis service unavailable.';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const analysisData = data.data;
      const analysisResult = {
        rawAnalysis: analysisData,
        sourceType: 'url',
        sourceText: urlInput.trim(),
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        summary: analysisData?.summary || { title: 'Intelligence Report' },
        pestle: analysisData?.pestle,
        motive: analysisData?.motive,
        party: analysisData?.partyImpact,
        stock: analysisData?.marketImpact,
        manipulation: analysisData?.credibility,
      };
      sessionStorage.setItem('analysisResult', JSON.stringify({
  ...analysisData,     // 直接保存後端回來的 data
  sourceType: 'url',
  sourceText: urlInput.trim(),
  timestamp: new Date().toISOString(),
  userId: session.user.id,
}));

      toast.success('Analysis complete');
      navigate('/results');
    } catch (err: any) {
      const msg = err?.message || 'Analysis failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-blue-200 dark:selection:bg-blue-500 selection:text-slate-900 dark:selection:text-white overflow-x-hidden transition-colors duration-300">
<Helmet>
  {/* 🔥 TITLE = Google 最重要 */}
  <title>
    Detect News Bias & Market Impact | NexVeris AI Decision Intelligence
  </title>

  {/* 🔥 DESCRIPTION = 影響點擊率 */}
  <meta
    name="description"
    content="Analyze news to detect bias, hidden motives, power dynamics, and market impact before narratives move prices. Built for investors and strategic thinkers."
  />

  {/* 🔥 關鍵字（次要，但有幫助） */}
  <meta
    name="keywords"
    content="news bias analysis, market impact analysis, PESTLE analysis, political motive detection, stock market news intelligence, decision intelligence"
  />
</Helmet>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[90px] animate-pulse opacity-70 dark:hidden"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[90px] animate-pulse opacity-70 dark:hidden" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="container mx-auto px-6 pt-24 pb-12">

        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-28">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8 relative z-10">

            
{/* Headline */}
{/* ✅ SEO PRIMARY H1 — invisible to users, clear to Google */}
<h1 className="sr-only">
  Turn News Into Decision Intelligence
</h1>

{/* ✅ SEO SUPPORTING H2 */}
<h2 className="sr-only">
  Reveal bias, hidden motives, power dynamics, and market consequences before the market reacts.
</h2>
{/* Headline */}
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white anim-slide-stretch-left">
  Most people read the NEWS. <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x dark:hidden">Others trade the truth</span>
  <span className="hidden dark:inline text-white">Others trade the truth</span>
</h1>

            <p className="text-xl text-slate-600 dark:text-slate-400">See what others miss.</p>

            {/* Input Form */}
            <form onSubmit={handleAnalyzeNews} className="max-w-lg mx-auto lg:mx-0 relative group anim-slide-stretch-left">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-full p-2 shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="pl-4 text-slate-400 dark:text-slate-400">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste article URL to analyze..." 
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 focus:outline-none text-lg"
                />
                <button type="submit" disabled={isLoading} className={`rounded-full px-8 py-3 font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 ${isLoading ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'}`}>
                  {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>) : (<>Analyze <ArrowRight className="w-4 h-4" /></>)}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-3 ml-4 text-center lg:text-left">{error}</p>
              )}
              
            </form>
          </div>

          {/* RIGHT COLUMN VISUAL */}
          <div className="lg:col-span-5 relative hidden lg:block perspective-1000">
            <div className="relative z-10 transform rotate-y-12 rotate-x-6 transition-transform duration-500 hover:rotate-0">
              <img
                src="https://zgiwqbpalykrztvvekcg.supabase.co/storage/v1/object/public/Nex/Table.png"
                alt="Intelligence metrics and strategic verdict"
                className="w-full shadow-2xl transform-gpu anim-tv-on anim-delay-2500 anim-hidden"
                style={{ clipPath: 'inset(8px)' }}
              />
            </div>
            <div className="text-center mt-6">
              <button onClick={() => navigate('/analyze')} className="text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1">
                Try it on one article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-20">
          <div className="mx-auto max-w-6xl px-6">
            <CyberChain fullWidth theme="purple" direction="horizontal" />
          </div>
        </div>


        {/* ==================== ENHANCED INTELLIGENCE GAP SECTION ==================== */}
        <section className="relative py-20 -mx-6 px-6">
          <div className="max-w-6xl mx-auto">

            {/* Section Header */}
            <div className="mb-16 text-center">
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Where Most Readers Lose the Edge
              </h2>
            </div>
            <div className="mb-14 max-w-3xl mx-auto text-center space-y-3">
              <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300">Why am I always reacting instead of anticipating?</p>
              <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300">Whose interests am I acting on without realizing it?</p>
            </div>
            

            {/* Core Grid - Enhanced Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">

              {/* Card 1: Blind Spots */}
              <div className="group relative bg-white dark:bg-slate-900/70 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-10 md:p-12 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/40 overflow-hidden">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800"></div>
                
                {/* Icon */}
                <div className="mb-6 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                  Information Blind Spots
                </h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-5">Most reporting omits complicating facts.</p>
                
                {/* Action */}
              </div>

              {/* Card 2: Narrative Bias */}
              <div className="group relative bg-white dark:bg-slate-900/70 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-10 md:p-12 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/40 overflow-hidden">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800"></div>
                
                {/* Icon */}
                <div className="mb-6 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Scale className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                  Narrative Bias
                </h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-5">Emotional framing distorts judgment.</p>
                
                {/* Action */}
              </div>

              {/* Card 3: Reaction Lag */}
              <div className="group relative bg-white dark:bg-slate-900/70 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-10 md:p-12 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/40 overflow-hidden">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800"></div>
                
                {/* Icon */}
                <div className="mb-6 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <LineChart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4">
                  Reaction Lag
                </h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-5">By the time it trends, the edge is gone.</p>
                
                {/* Action */}
              </div>

            </div>


            
          </div>
        </section>

        <div className="my-16 w-24 h-px bg-slate-200 dark:bg-slate-800 mx-auto"></div>

        <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-20">
          <div className="mx-auto max-w-6xl px-6">
            <CyberChain fullWidth theme="purple" direction="horizontal" />
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* END NEW SECTION                                             */}
        {/* ----------------------------------------------------------- */}

        <section id="signal-questions" className="relative py-24 bg-slate-50 dark:bg-slate-900 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <div className="relative z-10">
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70">
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-stretch gap-5 md:gap-6">
                  <div className="group relative flex-1 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xl font-heading text-slate-900 dark:text-white first-letter:text-5xl first-letter:leading-none first-letter:mr-2">What is this News trying to make you feel?</p>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">Reaction is rarely the truth.</p>
                  <div className="mt-0">
                    <div className="w-full opacity-0 -translate-y-2 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-72 transition-all rounded-b-2xl rounded-t-none p-0 bg-slate-50 dark:bg-slate-900" style={{ transitionDuration: '800ms' }}>
                      <p className="px-0 py-4 text-xl font-heading font-semibold tracking-tight text-blue-700 dark:text-cyan-300">Pause — separate emotion from fact.</p>
                    </div>
                  </div>
                  </div>
                <div className="group relative flex-1 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xl font-heading text-slate-900 dark:text-white first-letter:text-5xl first-letter:leading-none first-letter:mr-2">
                    What are they not saying — and why?
                  </p>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">What’s missing matters.</p>
                  <div className="mt-0">
                    <div className="w-full opacity-0 -translate-y-2 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-72 transition-all rounded-b-2xl rounded-t-none p-0 bg-slate-50 dark:bg-slate-900" style={{ transitionDuration: '800ms' }}>
                      <p className="px-0 py-4 text-xl font-heading font-semibold tracking-tight text-cyan-700 dark:text-teal-300">Expose the gaps.</p>
                    </div>
                  </div>
                </div>
                <div className="group relative flex-1 p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xl font-heading text-slate-900 dark:text-white first-letter:text-5xl first-letter:leading-none first-letter:mr-2">
                    Who wins if you believe this?
                  </p>
                  <p className="mt-3 text-slate-600 dark:text-slate-300">Every story serves someone.</p>
                  <div className="mt-0">
                    <div className="w-full opacity-0 -translate-y-2 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:translate-y-0 group-hover:max-h-72 transition-all rounded-b-2xl rounded-t-none p-0 bg-slate-50 dark:bg-slate-900" style={{ transitionDuration: '800ms' }}>
                      <p className="px-0 py-4 text-xl font-heading font-semibold tracking-tight text-purple-700 dark:text-purple-300">Expose hidden incentives.</p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
          </div>
          </div>
          
          <div className="my-12 w-24 h-px bg-slate-200 dark:bg-slate-800 mx-auto"></div>
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-12 md:p-16 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-black/40 mt-20 mb-16">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">Grounded metrics.</p>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-slate-900 dark:text-white text-center mb-8">Finally. Something solid.</h2>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div className="group">
                <div className="text-6xl md:text-7xl font-black text-emerald-700 mb-3 dark:hidden">78%</div>
                <div className="hidden dark:block text-6xl md:text-7xl font-black text-emerald-300 mb-3">78%</div>
                <div className="text-xs font-normal tracking-normal text-slate-600 dark:text-slate-400">context omitted</div>
              </div>
              <div className="group md:border-l md:border-slate-200 dark:md:border-slate-700">
                <div className="text-6xl md:text-7xl font-black text-indigo-700 mb-3 dark:hidden">3.2x</div>
                <div className="hidden dark:block text-6xl md:text-7xl font-black text-indigo-300 mb-3">3.2x</div>
                <div className="text-xs font-normal tracking-normal text-slate-600 dark:text-slate-400">bias detected faster</div>
              </div>
              <div className="group md:border-l md:border-slate-200 dark:md:border-slate-700">
                <div className="text-6xl md:text-7xl font-black text-cyan-700 mb-3 dark:hidden">24h</div>
                <div className="hidden dark:block text-6xl md:text-7xl font-black text-cyan-300 mb-3">24h</div>
                <div className="text-xs font-normal tracking-normal text-slate-600 dark:text-slate-400">advance warning</div>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <button onClick={() => navigate('/analyze')} className="text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1">
              Try it on one article
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
        </section>

        <div className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-20">
          <div className="mx-auto max-w-6xl px-6">
            <CyberChain fullWidth theme="purple" direction="horizontal" />
          </div>
        </div>

        {/* FAQ SECTION */}
        <div className="my-16 w-24 h-px bg-slate-200 dark:bg-slate-800 mx-auto"></div>
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50 shadow-xl p-14 md:p-20">
            <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
              <span className="text-slate-900 dark:text-white">Common </span>
              <span className="text-blue-600 dark:text-cyan-400">questions</span>
            </h2>
            {(() => {
              const faqs = [
                { question: 'What is NexVeris?', answer: 'A strategic intelligence platform that surfaces market-moving signals from news.' },
                { question: 'Is my data private?', answer: 'Yes. Sessions are secured; credentials are never exposed.' }
              ];
              return (
                <div className="mt-10 divide-y divide-slate-200 dark:divide-slate-800">
                  {faqs.map((item, idx) => (
                    <div key={idx} className="py-6">
                      <button
                        className="w-full flex items-center justify-between"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      >
                        <div className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
                          {item.question}
                        </div>
                        <ChevronDown className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 pt-4">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Turn Noise Into Knowledge</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Your competitive edge starts with understanding the world better — faster.
          </p>

          <button
            onClick={() => navigate("/analyze")}
            className="px-8 py-3 text-base font-semibold rounded-full bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-all shadow-lg"
          >
            Start Analyzing
          </button>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="py-10 border-t border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-500 text-sm">
        <p className="text-slate-700 dark:text-slate-400">
          © {new Date().getFullYear()} NexVeris.ai — Intelligent News Analysis Engine
        </p>
        <p className="mt-2">
          <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </a>
          {" • "}
          <a href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Terms & Conditions
          </a>
        </p>
      </footer>

    </div>
  );
}
