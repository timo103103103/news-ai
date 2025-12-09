import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  Menu,
  X,
  ClipboardPaste,
  Cpu,
  LayoutDashboard,
  Target, // For PESTLE
  TrendingUp, // For Market
  ShieldAlert, // For Credibility
  ArrowUpRight, // For Market Up
  ArrowDownRight // For Market Down
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/news-intelligence.css';
import '../styles/analysis-components.css';

// Helper component for the professional-looking mini-bars
const MiniBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-gray-600 w-20">{label}</span>
    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
    </div>
    <span className="text-xs font-semibold text-gray-800 w-6 text-right">{value}</span>
  </div>
);

// Combined Home component (Professional "Decision Support" Design)
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [currentText, setCurrentText] = useState(0);
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Change text once after 3.5 seconds for better anticipation
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentText(1);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleAnalyzeNews = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (urlInput) {
        console.log("Analyzing:", urlInput);
        sessionStorage.setItem('analysisUrl', urlInput);
    }
    navigate('/news-analysis'); 
  };

  return (
    <div className="news-landing-page font-sans text-slate-900 bg-gray-50">
      
      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-50 -z-10" />
        
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 items-start">
            
            {/* Left Side: Headline, CTA, & Stats */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>Trusted by 10,000+ analysts worldwide</span>
              </div>

              {/* Headline with ULTRA-SMOOTH animation */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                <span className="block text-slate-900">Stop Reading.</span>
                <span className="block">
                  Start{' '}
                  <span className="relative inline-block" style={{ minHeight: '1.2em', zIndex: 10 }}>
                    {/* Understanding - Solid Blue */}
                    <span 
                      className="whitespace-nowrap inline-block"
                      style={{
                        color: '#2563eb',
                        opacity: currentText === 0 ? 1 : 0,
                        transform: currentText === 0 ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
                        position: currentText === 0 ? 'relative' : 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 20,
                        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      Understanding
                    </span>
                    {/* Seeing the Truth - Gradient */}
                    <span 
                      className="whitespace-nowrap inline-block"
                      style={{
                        background: 'linear-gradient(to right, #2563eb, #9333ea)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        opacity: currentText === 1 ? 1 : 0,
                        transform: currentText === 1 ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
                        position: currentText === 1 ? 'relative' : 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 20,
                        transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >Seeing the Truth</span>
                  </span>
                  .
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 mt-4">AI-powered news analysis that cuts through the noise. Get PESTLE breakdowns, bias detection, and market impact in seconds—not hours.</p>

              {/* CTA Input */}
              <form onSubmit={handleAnalyzeNews} className="max-w-lg mx-auto lg:mx-0 mb-10">
                <div className="relative flex items-center bg-white rounded-full shadow-xl border border-gray-200 p-2">
                  <Search className="w-5 h-5 text-slate-400 ml-4" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste any news article URL..."
                    className="flex-1 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none bg-transparent"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Analyze Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-3xl font-bold text-slate-900">2M+</div>
                  <div className="text-sm text-slate-600">Articles Analyzed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">95%</div>
                  <div className="text-sm text-slate-600">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">&lt;5s</div>
                  <div className="text-sm text-slate-600">Analysis Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-600">Data Sources</div>
                </div>
              </div>
            </div>
            
            

          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to decode any news article
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Paste URL</h3>
              <p className="text-slate-600">Copy any news article link and paste it into our analyzer</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Analysis</h3>
              <p className="text-slate-600">Our AI processes the article in under 5 seconds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Insights</h3>
              <p className="text-slate-600">View PESTLE analysis, credibility score, and market impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Your Instant Intelligence Briefing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our analysis report is designed to be simple, professional, and powerful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: PESTLE Scan (Flip Card) */}
            <div className="flip-card" role="button" tabIndex={0} onClick={() => navigate('/pricing')} onKeyDown={(e) => { if ((e as any).key === 'Enter' || (e as any).key === ' ') navigate('/pricing'); }}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-white p-8 rounded-lg shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">PESTLE Environmental Scan</h3>
                  <p className="text-slate-600 leading-relaxed mb-5">Instantly understand the Political, Economic, Social, Technological, Legal, and Environmental impact.</p>
                  <div className="space-y-2">
                    <MiniBar label="Political" value={85} color="bg-blue-500" />
                    <MiniBar label="Economic" value={60} color="bg-green-500" />
                    <MiniBar label="Technological" value={90} color="bg-purple-500" />
                  </div>
                </div>
                <div className="flip-card-back bg-blue-600 text-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-2">PESTLE Highlights</h3>
                  <p className="text-blue-100 mb-4">DeepRead reveals geopolitical risk in seconds. Explore full breakdowns and save time.</p>
                  <button className="px-5 py-2 rounded-md bg-white text-blue-700 font-semibold hover:bg-blue-50" onClick={(e) => { (e as any).stopPropagation(); navigate('/pricing'); }}>Explore Analysis</button>
                </div>
              </div>
            </div>

            {/* Feature 2: Credibility & Bias (Flip Card) */}
            <div className="flip-card" role="button" tabIndex={0} onClick={() => navigate('/pricing')} onKeyDown={(e) => { if ((e as any).key === 'Enter' || (e as any).key === ' ') navigate('/pricing'); }}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-white p-8 rounded-lg shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Credibility & Bias Score</h3>
                  <p className="text-slate-600 leading-relaxed mb-5">Our AI flags manipulation, checks for author bias, and verifies sources to give you a simple credibility score.</p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Manipulation Score</span>
                      <span className="text-2xl font-bold text-red-600">78</span>
                    </div>
                    <p className="text-xs text-red-700 font-semibold">High Risk: Emotionally loaded language and unverified claims detected.</p>
                  </div>
                </div>
                <div className="flip-card-back bg-red-600 text-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-2">Credibility Insights</h3>
                  <p className="text-red-100 mb-4">See source reliability, author bias, and manipulation flags at a glance.</p>
                  <button className="px-5 py-2 rounded-md bg-white text-red-700 font-semibold hover:bg-red-50" onClick={(e) => { (e as any).stopPropagation(); navigate('/pricing'); }}>View Details</button>
                </div>
              </div>
            </div>

            {/* Feature 3: Market & Stakeholders (Flip Card) */}
            <div className="flip-card" role="button" tabIndex={0} onClick={() => navigate('/pricing')} onKeyDown={(e) => { if ((e as any).key === 'Enter' || (e as any).key === ' ') navigate('/pricing'); }}>
              <div className="flip-card-inner">
                <div className="flip-card-front bg-white p-8 rounded-lg shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Market & Stakeholder Impact</h3>
                  <p className="text-slate-600 leading-relaxed mb-5">See who wins and who loses. We identify affected stocks, sectors, and key players.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Intel (INTC)</span>
                      <span className="flex items-center text-sm font-medium text-green-600"><ArrowUpRight className="w-4 h-4" /> Positive</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Samsung (SSNLF)</span>
                      <span className="flex items-center text-sm font-medium text-red-600"><ArrowDownRight className="w-4 h-4" /> Negative</span>
                    </div>
                  </div>
                </div>
                <div className="flip-card-back bg-green-600 text-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-xl font-bold mb-2">Market Impact</h3>
                  <p className="text-green-100 mb-4">Understand sector winners/losers and stakeholder effects with clarity.</p>
                  <button className="px-5 py-2 rounded-md bg-white text-green-700 font-semibold hover:bg-green-50" onClick={(e) => { (e as any).stopPropagation(); navigate('/pricing'); }}>See Examples</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* --- Final CTA Section --- */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Decode the News?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of analysts, investors, and decision-makers who trust our AI to cut through media spin.
          </p>
          
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl text-lg flex items-center gap-3 mx-auto"
          >
            Start Free Analysis
            <ArrowRight className="w-5 h-5" />
          </button>

        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
           <div className="grid md:grid-cols-4 gap-8 mb-8">
             <div>
               <div className="mb-4">
                 <Logo size={64} showText={false} />
               </div>
               <p className="text-sm">AI-powered news analysis for the modern world.</p>
             </div>
             <div>
               <h4 className="font-semibold text-white mb-3">Product</h4>
               <ul className="space-y-2 text-sm">
                 <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                 <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a></li>
                 <li><a href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
               </ul>
             </div>
             <div>
               <h4 className="font-semibold text-white mb-3">Company</h4>
               <ul className="space-y-2 text-sm">
                 <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
               </ul>
             </div>
             <div>
               <h4 className="font-semibold text-white mb-3">Legal</h4>
               <ul className="space-y-2 text-sm">
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                 <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
               </ul>
             </div>
           </div>
           <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-sm">&copy; 2025 NexVeris AI. All rights reserved.</p>
             <div className="flex gap-6 text-sm">
               <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
               <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
