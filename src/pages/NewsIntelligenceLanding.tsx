import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Zap, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/news-intelligence.css';
import '../styles/analysis-components.css';

const NewsIntelligenceLanding = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnalyzeNews = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (urlInput) {
        console.log("Analyzing:", urlInput);
    }
    navigate('/news-analysis');
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Signal vs. Noise Scoring",
      description: "Instantly see ✅ Positive or ❌ Negative impact flags for every key stakeholder mentioned in the article."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "PESTLE 'Why' Logic",
      description: "We don't just say 'Political Risk'. We give you the exact sentence in the text that triggered the alert."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: "Market Impact Forecast",
      description: "Free: See if the outlook is Bullish or Bearish. Premium: Get the exact stock tickers and sector correlation."
    }
  ];

  const benefits = [
    "Instant ✅/❌ impact verdict on key topics",
    "Evidence-based reasoning for every score",
    "Identify hidden political bias instantly",
    "Export basic briefs to PDF (Free)"
  ];

  return (
    <div className="news-landing-page font-sans text-slate-900 bg-white">
      {/* --- Navigation --- */}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="cursor-pointer" onClick={() => navigate('/')}> 
            <Logo size={56} showText={false} />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#impact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Impact Analysis</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</a>
            <button 
              onClick={() => handleAnalyzeNews()} 
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
            >
              Start Analyzing
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4">
           <div className="w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/4">
           <div className="w-[600px] h-[600px] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Updated: New "Evidence-Based" Reasoning Engine
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Turn News Noise into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Binary Decisions
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Don't just read. Know if it's <span className="text-green-600 font-bold">Good</span> or <span className="text-red-600 font-bold">Bad</span> for your portfolio. 
            Get instant impact verdicts and the exact reasoning behind them.
          </p>

          {/* Interactive Input Simulation */}
          <div className="max-w-2xl mx-auto relative z-20 mb-12">
            <form onSubmit={handleAnalyzeNews} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Paste article URL here (e.g., bloomberg.com/article...)" 
                className="w-full pl-12 pr-40 py-4 rounded-2xl border border-slate-200 shadow-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                Analyze <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
          </div>

          {/* Social Proof Strip */}
          <div className="pt-8 border-t border-slate-100 max-w-4xl mx-auto">
            <p className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Trusted by analysts at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold text-slate-800">GlobalFund</span>
              <span className="text-xl font-bold text-slate-800">PolitiCorp</span>
              <span className="text-xl font-bold text-slate-800">AlphaStream</span>
              <span className="text-xl font-bold text-slate-800">NewsDesk</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid (Bento Box Style) --- */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Intelligence Beyond the Headline</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Most tools just summarize. We grade. Our engine breaks down complex narratives into actionable data points with clear justification.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Split Section: Why Use Us (Updated Visuals for Tick/Cross) --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white p-6 aspect-video flex flex-col justify-center">
                 
                 {/* Simulated Free vs Premium Comparison UI */}
                 <div className="space-y-4">
                    {/* Free Item 1 */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Tech Sector: Positive Impact</div>
                            <div className="text-xs text-slate-500 mt-1">Reason: "New subsidy announced for AI chips."</div>
                        </div>
                    </div>

                    {/* Free Item 2 */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <XCircle className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                        <div>
                            <div className="font-bold text-slate-800 text-sm">Regulatory Risk: High</div>
                            <div className="text-xs text-slate-500 mt-1">Reason: "Antitrust probe explicitly mentioned."</div>
                        </div>
                    </div>

                    {/* Premium Teaser */}
                    <div className="relative p-3 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Premium Insight
                            </div>
                        </div>
                        <div className="opacity-40 blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-white font-bold text-sm">Specific Ticker Impact</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    </div>
                 </div>

              </div>
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Clear Verdicts. No Guesswork.
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                The free plan gives you the "What" and the "Why". See exactly which parts of an article are positive or negative for your interests.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <button 
                  onClick={handleAnalyzeNews}
                  className="text-blue-600 font-bold hover:text-blue-700 inline-flex items-center gap-2 group"
                >
                  View sample free report 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Testimonials --- */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
             <div className="absolute inset-0" 
                  style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by the best</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
                <div className="flex text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-300 mb-6 italic">"The 'Reasoning' feature is a game changer. It highlights exactly why a score was given, saving me from reading the whole text."</p>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">S</div>
                   <div>
                      <div className="font-bold">Sarah Chen</div>
                      <div className="text-xs text-slate-400">Senior Financial Analyst</div>
                   </div>
                </div>
             </div>
             
             <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
                <div className="flex text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-300 mb-6 italic">"I use the free version for quick checks. The tick/cross system is so intuitive I upgraded just to get the deeper data."</p>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">M</div>
                   <div>
                      <div className="font-bold">Mike Ross</div>
                      <div className="text-xs text-slate-400">Consultant, Strategy Inc.</div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 md:col-span-2 lg:col-span-1">
                <div className="flex text-amber-400 mb-4">★★★★★</div>
                <p className="text-slate-300 mb-6 italic">"Finally, a tool that doesn't just summarize but actually analyzes risk factors with evidence."</p>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold">J</div>
                   <div>
                      <div className="font-bold">Jessica L.</div>
                      <div className="text-xs text-slate-400">Portfolio Manager</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to see clearly?</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            Join 2,000+ professionals using NewsIntel to make smarter, faster decisions.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
             <button onClick={() => handleAnalyzeNews()} className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-xl">
               Start Analyzing Free
             </button>
             <button className="w-full md:w-auto px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
               Schedule Demo
             </button>
          </div>
          <p className="mt-6 text-sm text-blue-200 opacity-80">
             <ShieldCheck className="w-4 h-4 inline mr-1" /> 
             Enterprise-grade security & privacy
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-slate-400 text-sm">
            &copy; 2025 NexVeris AI. All rights reserved.
           </div>
           <div className="flex gap-6">
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy</a>
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Terms</a>
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Twitter</a>
             <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">LinkedIn</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsIntelligenceLanding;
