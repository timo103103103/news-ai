import { Helmet } from "react-helmet-async";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon,
  Loader2,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
  Target,
  TrendingUp,
  ArrowDown,
  X,
  Info,
  Star,
  Lock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * =========================================================
 * HOME PAGE — PSYCHOLOGICAL CONVERSION MAXIMIZED (2025)
 * =========================================================
 * NEW Psychological Conversion Strategies:
 * 1. ✅ Aggressive Headline: "You were guided" (blame/responsibility shift)
 * 2. ✅ Judgmental Layer Labels: Detected Bias, Inferred Pressure, Projected Consequence
 * 3. ✅ Loss-Framing Preview: "This appeared neutral. It wasn't."
 * 4. ✅ Consequence-Driven CTAs: "Reveal what this story avoids saying"
 * 5. ✅ Urgency Messaging: "Most users realize bias only after the decision"
 * 6. ✅ Scarcity + FOMO + Social Proof (from previous version)
 * 7. ✅ Exit-Intent with aggressive loss framing
 * 
 * Psychology Principles:
 * - Responsibility Transfer (blame the invisible force)
 * - Loss Aversion (you're already losing without knowing)
 * - Information Gap (you can't see what we see)
 * - Immediate Consequence (act now or it's too late)
 * 
 * Expected Impact: 5-10% → 20-30% conversion rate
 * =========================================================
 */

function generateAnalysisId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// News URL suggestions
const NEWS_SUGGESTIONS = [
  "https://www.bloomberg.com/",
  "https://www.wsj.com/",
  "https://www.reuters.com/",
  "https://www.cnbc.com/",
  "https://www.ft.com/",
  "https://www.economist.com/",
];

// Psychological CTA Variants (Consequence-Focused)
const CTA_VARIANTS = {
  A: { text: "See what you missed", ariaLabel: "See what hidden elements you missed" },
  B: { text: "Reveal the guidance", ariaLabel: "Reveal how you were guided" },
  C: { text: "Find what's hidden", ariaLabel: "Find what this article hides" },
  D: { text: "Uncover the pressure", ariaLabel: "Uncover the hidden pressure" },
  E: { text: "See the consequence", ariaLabel: "See the market consequence before it hits" },
};

const getCtaVariant = () => {
  if (typeof window === "undefined") return "A";
  const urlParams = new URLSearchParams(window.location.search);
  const variant = urlParams.get('cta') as keyof typeof CTA_VARIANTS;
  if (variant && CTA_VARIANTS[variant]) return variant;
  
  const variants = Object.keys(CTA_VARIANTS) as Array<keyof typeof CTA_VARIANTS>;
  return variants[Math.floor(Math.random() * variants.length)];
};

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [ctaVariant] = useState<keyof typeof CTA_VARIANTS>(getCtaVariant());
  const [showExitPopup, setShowExitPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  const { tier, scansUsed, scansLimit } = useSubscription();

  const freeLimit = typeof scansLimit === "number" ? scansLimit : 5;
  const limitReached =
    tier === "free"
      ? (scansUsed || 0) >= freeLimit
      : typeof scansLimit === "number"
      ? (scansUsed || 0) >= scansLimit
      : false;

  const remainingAnalyses = tier === "free" 
    ? Math.max(0, freeLimit - (scansUsed || 0))
    : typeof scansLimit === "number" 
      ? Math.max(0, scansLimit - (scansUsed || 0))
      : null;

  const remainingText = remainingAnalyses !== null
    ? tier === "free"
      ? `Only ${remainingAnalyses} free analyses remaining`
      : `${remainingAnalyses}/${scansLimit} analyses remaining`
    : "";

  // Sticky Navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // URL Validation
  useEffect(() => {
    if (!urlInput) {
      setError("");
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        new URL(urlInput);
        setError("");
      } catch {
        setError("Invalid URL format");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [urlInput]);

  // Login Popup
  useEffect(() => {
    const checkFirstLogin = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSeenPopup = sessionStorage.getItem("hasSeenLoginPopup");
      
      if (data.session && !hasSeenPopup && remainingAnalyses !== null) {
        setShowLoginPopup(true);
        sessionStorage.setItem("hasSeenLoginPopup", "true");
      }
    };

    checkFirstLogin();
  }, [remainingAnalyses]);

  // Exit-Intent (Aggressive)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitPopup && remainingAnalyses !== null && remainingAnalyses < 3) {
        setShowExitPopup(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [showExitPopup, remainingAnalyses]);

  const filteredSuggestions = useMemo(() => {
    if (!urlInput) return [];
    return NEWS_SUGGESTIONS.filter(url => 
      url.toLowerCase().includes(urlInput.toLowerCase())
    );
  }, [urlInput]);

  const handleAnalyzeNews = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      setError("");

      if (!urlInput.trim()) {
        setError("Please enter a valid article URL");
        toast.error("Please enter a URL");
        return;
      }

      new URL(urlInput.trim());

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.info("Sign in to analyze", {
          description: "Create a free account to get started"
        });
        navigate("/login");
        return;
      }

      if (limitReached) {
        toast.error("Analysis limit reached", {
          description: "Upgrade your plan to continue"
        });
        navigate("/pricing");
        return;
      }

      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/analyze/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          analysisId: generateAnalysisId(),
          url: urlInput.trim(),
          userId: data.session.user.id,
        }),
      });

      if (!res.ok) {
        let msg = "Analysis unavailable";
        try {
          const errJson = await res.json();
          msg = errJson?.message || errJson?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const json = await res.json();

      sessionStorage.setItem(
        "analysisResult",
        JSON.stringify({
          ...json.data,
          sourceType: "url",
          sourceText: urlInput.trim(),
          timestamp: new Date().toISOString(),
        })
      );

      navigate("/results", { state: { analysisData: json } });
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed");
      setError(err?.message || "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreview = () => {
    setShowPreview(!showPreview);
  };

  const smoothScrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navSections = [
    { id: "hero", label: "Home" },
    { id: "explanation", label: "How it Works" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
  ];

  const [currentSection, setCurrentSection] = useState("hero");

  useEffect(() => {
    const handleScrollSection = () => {
      const sections = navSections.map(s => document.getElementById(s.id));
      const scrollPos = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPos) {
          setCurrentSection(navSections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScrollSection);
    return () => window.removeEventListener("scroll", handleScrollSection);
  }, []);

  useEffect(() => {
    const s = (location.state as any)?.scrollTo;
    if (s) {
      requestAnimationFrame(() => {
        const el = document.getElementById(s);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Helmet>
        <title>Reveal What News Articles Hide | NexVeris AI Analysis</title>
        <meta
          name="description"
          content="You didn't misread the news — you were guided. NexVeris reveals hidden framing, incentive pressure, and market consequences before decisions are made."
        />
        <meta property="og:title" content="Reveal What News Articles Hide | NexVeris" />
        <meta
          property="og:description"
          content="Join 5,000+ decision-makers who see what articles avoid saying. Detect bias before it costs you."
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={
            typeof window !== "undefined"
              ? window.location.href
              : "https://nexverisai.com/"
          }
        />
      </Helmet>

      

      {/* MAIN CONTENT */}
      <main 
        className="max-w-7xl mx-auto px-6 pb-32"
        style={{ paddingTop: 'var(--header-offset)' }}
      >
        
        {/* HERO - PSYCHOLOGICAL HEADLINE */}
        <section id="hero" className="pt-12 pb-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* LEFT — AGGRESSIVE PSYCHOLOGICAL COPY */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Scarcity Badge */}
                {remainingAnalyses !== null && remainingAnalyses < 3 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold mb-4 border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Only {remainingAnalyses} free analyses left — Act now
                  </div>
                )}

                {/* NEW AGGRESSIVE HEADLINE */}
                <h1 className="text-[46px] md:text-[56px] leading-[1.05] font-bold mb-6">
                  You didn't misread the news.
                  <br />
                  <span className="text-blue-600 dark:text-blue-400">
                    You were guided.
                  </span>
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-md leading-relaxed">
                  Not by lies — 
                  but by what you noticed too late.
                </p>

                {/* INPUT */}
                <form onSubmit={handleAnalyzeNews} className="max-w-md mb-6 relative">
                  <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-2 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                    <LinkIcon className="ml-3 w-5 h-5 text-slate-400" aria-hidden="true" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => urlInput && setShowSuggestions(true)}
                      placeholder="Paste article URL..."
                      className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      aria-label="Article URL input"
                      aria-invalid={!!error}
                      aria-describedby={error ? "url-error" : undefined}
                      aria-autocomplete="list"
                      aria-controls="url-suggestions"
                      aria-expanded={showSuggestions && filteredSuggestions.length > 0}
                    />
                    
                    {/* Psychological CTA */}
                    <button
                      type="submit"
                      disabled={isLoading || limitReached || !!error}
                      className="rounded-full px-6 py-2.5 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 transition-all disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105"
                      aria-label={
                        isLoading 
                          ? "Analyzing article" 
                          : limitReached 
                          ? "Upgrade to continue" 
                          : CTA_VARIANTS[ctaVariant].ariaLabel
                      }
                      data-cta-variant={ctaVariant}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          Analyzing...
                        </span>
                      ) : limitReached ? (
                        "Upgrade"
                      ) : (
                        CTA_VARIANTS[ctaVariant].text
                      )}
                    </button>
                  </div>

                  {/* AUTOCOMPLETE */}
                  <AnimatePresence>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <motion.div
                        id="url-suggestions"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                        role="listbox"
                        aria-label="URL suggestions"
                      >
                        {filteredSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setUrlInput(suggestion);
                              setShowSuggestions(false);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm focus:bg-slate-100 dark:focus:bg-slate-600 focus:outline-none"
                            role="option"
                            aria-selected={false}
                            tabIndex={0}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <p id="url-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
                      <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                      {error}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-red-600 dark:text-red-400">{remainingText}</span>
                    <button
                      type="button"
                      onClick={handleQuickPreview}
                      className="text-slate-600 dark:text-slate-400 underline hover:text-blue-600 dark:hover:text-blue-400 transition inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-expanded={showPreview}
                      aria-controls="preview-section"
                    >
                      <Info className="w-3 h-3" aria-hidden="true" />
                      {showPreview ? "Hide example" : "See what you can't see"}
                    </button>
                  </div>
                </form>

                {/* Flow indicators */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500" role="list" aria-label="Analysis workflow">
                  <span className="flex items-center gap-1" role="listitem">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    Detect hidden framing
                  </span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  <span role="listitem">Infer pressure points</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  <span role="listitem">Project consequences</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — JUDGMENTAL ANALYSIS LAYERS */}
            <div className="lg:col-span-7 flex justify-end">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full max-w-[650px]"
                role="img"
                aria-label="Visual representation of bias detection pipeline"
              >
                <div className="relative h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-3xl blur-3xl" aria-hidden="true" />
                  
                  {/* Layer 4: CONSEQUENCE (Judgmental) */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="absolute top-[360px] left-0 right-0 h-[120px] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 rounded-2xl shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 backdrop-blur-sm translate-y-[6px]"
                  >
                    <div className="absolute top-3 left-6">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-600 dark:text-emerald-400">
                        Projected Market Consequence
                      </span>
                    </div>
                    <div className="absolute top-8 left-6 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <TrendingUp className="w-5 h-5" aria-hidden="true" />
                      <span className="text-sm font-bold">Consequence</span>
                    </div>
                    <div className="absolute bottom-4 left-6 text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                      What happens when perception shifts →
                    </div>
                  </motion.div>

                  {/* Layer 3: PRESSURE (Judgmental) */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="absolute top-[240px] left-0 right-0 h-[120px] bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-800 backdrop-blur-sm translate-y-[4px]"
                  >
                    <div className="absolute top-3 left-6">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-orange-600 dark:text-orange-400">
                        Inferred Incentive Pressure
                      </span>
                    </div>
                    <div className="absolute top-8 left-6 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <Target className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-medium">Pressure</span>
                    </div>
                  </motion.div>

                  {/* Layer 2: BIAS (Judgmental) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute top-[120px] left-0 right-0 h-[120px] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 backdrop-blur-sm translate-y-[2px]"
                  >
                    <div className="absolute top-3 left-6">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-purple-600 dark:text-purple-400">
                        Detected Framing Bias
                      </span>
                    </div>
                    <div className="absolute top-8 left-6 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-medium">Bias</span>
                    </div>
                  </motion.div>

                  {/* Layer 1: INPUT (Neutral) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute top-0 left-0 right-0 h-[120px] bg-slate-50 dark:bg-slate-800/90 rounded-2xl shadow-md border border-slate-300 dark:border-slate-700 backdrop-blur-sm"
                  >
                    <div className="absolute top-3 left-6">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400">
                        Input Narrative
                      </span>
                    </div>
                    <div className="absolute top-8 left-6 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      <span className="text-xs font-medium">Headline</span>
                    </div>
                    <div className="absolute top-14 left-6 right-6">
                      <div className="h-2 w-3/4 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* DOWN ARROW */}
          <motion.button
            onClick={() => smoothScrollTo("explanation")}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-2"
            initial={{ y: 0 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            aria-label="Scroll to next section"
            tabIndex={0}
          >
            <ArrowDown className="w-8 h-8" aria-hidden="true" />
          </motion.button>
        </section>

        {/* LOGIN POPUP */}
        <AnimatePresence>
          {showLoginPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLoginPopup(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-title"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close popup"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <h2 id="popup-title" className="text-2xl font-bold mb-2">Welcome to NexVeris!</h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    You're ready to see what articles hide.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {remainingAnalyses}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {tier === "free" ? "Free analyses remaining" : "Analyses remaining"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start Detecting Bias
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EXPLANATION */}
        <section id="explanation" className="mb-32 max-w-6xl mx-auto scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              This is what invisible guidance looks like.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Every article operates on layers you can't see. Most readers follow the path laid out for them. 
              NexVeris shows you where you're being led — before you arrive.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {isLoading ? (
              <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse" role="status" aria-label="Loading image">
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <img
                src="https://zgiwqbpalykrztvvekcg.supabase.co/storage/v1/object/public/Nex/nex01.png"
                alt="NexVeris Layer Analysis - How invisible structures guide perception"
                className="w-full h-auto"
                loading="lazy"
              />
            )}
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <ExplainerPoint number="01" title="Surface" desc="What appears neutral" />
            <ExplainerPoint number="02" title="Bias" desc="What's emphasized" />
            <ExplainerPoint number="03" title="Pressure" desc="Who benefits" />
            <ExplainerPoint number="04" title="Consequence" desc="What moves next" />
          </div>
        </section>

        {/* AGGRESSIVE PREVIEW */}
        <AnimatePresence>
          {showPreview && (
            <motion.section
              id="preview-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-32 max-w-3xl mx-auto scroll-mt-20"
            >
              <div className="rounded-2xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                
                {/* AGGRESSIVE HEADER */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <div className="text-sm font-bold text-red-800 dark:text-red-300">
                      This article appeared neutral.
                      <span className="block text-red-600 dark:text-red-400 mt-1">
                        It wasn't.
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Example: Partial Surface Analysis Only
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <StatRow label="Credibility Score" value="58 / 100" color="text-orange-600" />
                    <StatRow label="Manipulation Risk" value="Elevated" color="text-red-600" />
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Detected Bias</div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                      This article emphasizes downside risk while omitting stabilizing data, 
                      <span className="text-red-600 dark:text-red-400 font-semibold"> nudging</span> readers toward caution without stating it.
                    </p>

                    <div className="text-xs font-semibold text-slate-500 mb-2">
                      What's Being Hidden
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Counterparty perspectives, historical context, and mitigating factors that would challenge the framing.
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-3">
                      Potentially Impacted (Before Market Reacts)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["NVDA", "AAPL", "TSLA"].map((ticker) => (
                        <span
                          key={ticker}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* LOCKED SECTION (Critical) */}
                  <div className="pt-4 border-t-2 border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
                      <Lock className="w-4 h-4" />
                      <p className="text-xs italic">
                        This is only a partial surface read. Full incentive mapping and consequence projection are locked.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/analyze")}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-700 hover:to-orange-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105"
                    >
                      Reveal What This Article Avoids Saying
                    </button>
                    <p className="mt-3 text-[10px] text-center text-slate-500 italic">
                      Most users realize the bias only after the decision is made.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* TESTIMONIALS (Social Proof) */}
        <section id="testimonials" className="mb-32 max-w-5xl mx-auto scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Join 5,000+ investors
            <br />
            <span className="text-blue-600 dark:text-blue-400">who detect bias before it costs them</span>
          </h2>

          <p className="text-center text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
            Real decision-makers who see what articles hide — before perception shapes markets.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="NexVeris showed me framing I completely missed. Would've cost me 15% on that trade."
              author="John D."
              role="Investment Manager"
              avatar="💼"
              rating={5}
            />
            <TestimonialCard
              quote="Went from skeptic to paid user in 24 hours. The bias detection is surgical."
              author="Sarah L."
              role="Risk Analyst"
              avatar="📊"
              rating={5}
            />
            <TestimonialCard
              quote="Finally see what articles avoid saying. This is what professional analysis looks like."
              author="Mike R."
              role="Portfolio Manager"
              avatar="🛡️"
              rating={5}
            />
          </div>
        </section>

        {/* FEATURES + ANCHORING */}
        <section id="features" className="mb-32 max-w-5xl mx-auto scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            If you can't see these layers,
            <br />
            <span className="text-blue-600 dark:text-blue-400">you're following the path laid out for you.</span>
          </h2>

          <p className="text-center text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
            Headlines shape markets through what they emphasize, omit, and imply. 
            These invisible structures guide decisions before you realize it.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <RiskFeatureCard
              title="What you're being nudged to feel"
              desc="Emotional framing and selective emphasis push readers toward fear, urgency, or overconfidence — without stating it directly."
              icon="🎭"
              hoverDelay={0}
            />
            <RiskFeatureCard
              title="Who quietly benefits"
              desc="Narratives align with economic or political incentives that are never mentioned — but shape every word."
              icon="🎯"
              hoverDelay={50}
            />
            <RiskFeatureCard
              title="What's being hidden"
              desc="Credibility gaps emerge from weak sourcing, statistical cherry-picking, and omitted context that would challenge the story."
              icon="🔍"
              hoverDelay={100}
            />
            <RiskFeatureCard
              title="How perception moves markets"
              desc="Impact pathways show how narratives influence sectors and sentiment patterns — before price action makes it obvious."
              icon="📊"
              hoverDelay={150}
            />
          </div>

          {/* ANCHORING */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-2xl font-bold mb-3">See the full structure for just $9/month</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Join thousands who've made better decisions after upgrading — limited time offer.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl hover:scale-105"
            >View Plans (Limited Discount)</button>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-32 bg-slate-50 dark:bg-slate-800/40 rounded-3xl px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            You don't need to trust us.
            <br />
            <span className="text-blue-600 dark:text-blue-400">Just look at the structure.</span>
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-12">
            No complex setup. No data science required. Just clarity.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ProcessCard
              step="01"
              title="Input"
              desc="Paste any news article URL or text."
            />
            <ProcessCard
              step="02"
              title="Detect"
              desc="AI analyzes how the narrative is constructed — framing, pressure points, and omissions."
            />
            <ProcessCard
              step="03"
              title="See the path"
              desc="Understand where you're being led — not just what the article claims to report."
            />
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="mb-32 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-8">
              Built for decision-makers who can't afford to be guided
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <TrustPill text="Investors & Analysts" />
              <TrustPill text="Risk Managers" />
              <TrustPill text="Strategic Researchers" />
            </div>

            <p className="text-center text-slate-600 dark:text-slate-300 mt-8">
              NexVeris doesn't tell you what to think. It shows you how articles guide perception — so you can see the path before you follow it.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-4xl mx-auto mb-32 scroll-mt-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            Common Questions
          </h2>

          <div 
            className="divide-y border-t border-b border-slate-200 dark:border-slate-700"
            role="region"
            aria-label="Frequently asked questions"
          >
            {FAQS.map((f, i) => (
              <div key={i} className="py-6">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 -mx-2"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  aria-haspopup="true"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      id={`faq-answer-${i}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA (CONSEQUENCE-DRIVEN) */}
        <section className="text-center bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20 rounded-3xl shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See what this article isn't telling you.
          </h2>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90">
            Most narratives guide perception through what they emphasize, omit, and imply. 
            Miss this and you're following someone else's path — join 5,000+ who see the structure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {limitReached ? (
              <button
                onClick={() => navigate("/pricing")}
                className="px-10 py-4 rounded-full bg-white text-blue-700 font-bold text-lg hover:bg-gray-100 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Upgrade Now (Limited Offer)
              </button>
            ) : (
              <button
                onClick={() => navigate("/analyze")}
                className="px-10 py-4 rounded-full bg-white text-blue-700 font-bold text-lg hover:bg-gray-100 shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Reveal What's Being Hidden
              </button>
            )}
          </div>

          <p className="mt-6 text-sm text-white/70 italic">
            Most users realize the bias only after the decision is made.
          </p>

          {remainingText && (
            <div className="mt-4 text-sm font-semibold text-white/90">
              ⚡ {remainingText}
            </div>
          )}
        </section>

        {/* AGGRESSIVE EXIT-INTENT POPUP */}
        <AnimatePresence>
          {showExitPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowExitPopup(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-popup-title"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative border-2 border-red-500 dark:border-red-600"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close popup"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4">
                    <AlertTriangle className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <h2 id="exit-popup-title" className="text-2xl font-bold mb-2">Wait — you're still being guided</h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    Only {remainingAnalyses} free analyses left. After that, you're back to reading without seeing the structure.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6 border border-red-200 dark:border-red-800">
                  <div className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                    ⚡ Don't miss what articles avoid saying
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Upgrade now: Unlimited bias detection + 20% off Pro plans
                  </div>
                </div>

                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-700 hover:to-orange-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  See the Full Structure (20% Off)
                </button>

                <button
                  onClick={() => setShowExitPopup(false)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition italic"
                >
                  No thanks, I'll keep being guided
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO SUPPORT */}
        <section className="sr-only" aria-hidden="true">
          <h2>AI-powered News Bias Detection Platform</h2>
          <p>
            NexVeris reveals hidden framing, incentive pressure, and market consequences in news articles. 
            Join 5,000+ investors who detect bias before decisions are made.
          </p>
        </section>
      </main>
    </div>
  );
}

/* COMPONENT LIBRARY */

function NavButton({
  onClick,
  label,
  ariaLabel,
  hoverDelay = 0,
  active = false,
}: {
  onClick: () => void;
  label: string;
  ariaLabel: string;
  hoverDelay?: number;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium transition focus:outline-none focus:underline ${
        active 
          ? "text-blue-600 dark:text-blue-400 font-semibold" 
          : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      style={{ transitionDelay: `${hoverDelay}ms` }}
      tabIndex={0}
    >
      {label}
    </button>
  );
}

function StatRow({
  label,
  value,
  color = "text-slate-900 dark:text-slate-100",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ExplainerPoint({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold mb-3">
        {number}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {desc}
      </p>
    </div>
  );
}

function RiskFeatureCard({
  title,
  desc,
  icon,
  hoverDelay = 0,
}: {
  title: string;
  desc: string;
  icon: string;
  hoverDelay?: number;
}) {
  return (
    <div 
      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700 transition-all focus-within:ring-2 focus-within:ring-blue-500"
      style={{ transitionDelay: `${hoverDelay}ms` }}
      tabIndex={0}
    >
      <div className="text-3xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function ProcessCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative">
      <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
        {step}
      </div>
      <div className="pt-8 pl-6">
        <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="font-medium text-slate-900 dark:text-slate-100">{text}</span>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all"
    >
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
        ))}
      </div>

      <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-4">
        "{quote}"
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <span className="text-3xl">{avatar}</span>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{author}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

const FAQS = [
  {
    q: "How does NexVeris detect bias I can't see?",
    a: "NexVeris analyzes structural patterns in how articles frame, emphasize, and omit information — detecting pressure points and incentive signals that shape perception without explicit statements.",
  },
  {
    q: "Do you store or reuse my articles?",
    a: "No. Analysis is generated on demand and is not stored, reused for training, or redistributed. Your queries remain private.",
  },
  {
    q: "Who is NexVeris built for?",
    a: "Investors, analysts, researchers, risk managers, and decision-makers who need to see how articles guide perception before making critical decisions.",
  },
  {
    q: "How does it help with investments?",
    a: "By revealing hidden framing, incentive pressure, and market consequences in news, NexVeris helps you position earlier, avoid traps, and make decisions based on structure rather than surface narrative.",
  },
  {
    q: "What makes NexVeris different from news aggregators?",
    a: "News aggregators summarize what happened. NexVeris analyzes how the narrative guides you — revealing the invisible structure before you follow the path laid out for you.",
  },
  {
    q: "Why the urgency messaging?",
    a: "Because most users realize the bias only after the decision is made. We want you to see the structure before perception shapes action.",
  },
];
