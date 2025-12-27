import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Loader2,
  Search,
  Scale,
  LineChart,
  ChevronDown,
  FileText,
  Brain,
  Target,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import HeroStackPreview from "../components/HeroStackPreview";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { buildReportJsonLd } from "@/lib/seo";

/**
 * =========================================================
 * HOME PAGE — SEO + DECISION INTELLIGENCE HUB
 * =========================================================
 * Goal:
 * - Speak investor language
 * - Make Google clearly understand what NexVeris is
 * - Act as the topic authority root for all landing pages
 */

export default function Home() {
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quickPreview, setQuickPreview] = useState<any | null>(null);

  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3005";

  const { tier, scansUsed, scansLimit } = useSubscription();
  const limitReached =
    tier === "free"
      ? (scansUsed || 0) >= 2
      : typeof scansLimit === "number"
        ? (scansUsed || 0) >= scansLimit
        : false;

  const handleAnalyzeNews = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setError("");
      if (!urlInput.trim()) {
        setError("Please enter a valid article URL");
        return;
      }

      new URL(urlInput.trim());

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/login");
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
          url: urlInput.trim(),
          userId: data.session.user.id,
        }),
      });

      if (!res.ok) throw new Error("Analysis unavailable");

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

      navigate("/results");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreview = () => {
    if (!urlInput.trim()) {
      setError("Please enter a valid article URL");
      return;
    }
    setError("");
    // Mock preview data (Example-only; not real analysis)
    setQuickPreview({
      label: "Example",
      biasScore: 58,
      direction: "Balanced",
      drivers: [
        { label: "Regulatory", type: "downside" },
        { label: "Technology", type: "upside" },
        { label: "Social", type: "upside" },
      ],
      tickers: ["AAA", "BBB", "CCC"],
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* ================= SEO HEAD ================= */}
      <Helmet>
        <title>AI News Analysis for Credibility & Market Impact | NexVeris</title>
        <meta
          name="description"
          content="NexVeris is an AI-powered news analysis platform that reveals credibility, bias, hidden incentives, and market impact behind news events."
        />
        <meta property="og:title" content="AI News Analysis | NexVeris" />
        <meta property="og:description" content="Credibility, bias, incentives, and market impact behind news events." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : "https://nexverisai.com/"} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "NexVeris Intelligence Platform",
            "url": "https://nexverisai.com",
            "publisher": {
              "@type": "Organization",
              "name": "NexVeris",
              "url": "https://nexverisai.com"
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is an AI news analysis tool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A platform that evaluates credibility, bias, incentives, and market impact across news articles to support decisions."
                }
              },
              {
                "@type": "Question",
                "name": "How does NexVeris detect media bias?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "NexVeris analyzes linguistic fingerprints and structural signals to identify framing, omissions, and persuasive patterns."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        {/* ================= HERO ================= */}
        <section className="grid lg:grid-cols-12 gap-16 items-center mb-32 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10 pointer-events-none rounded-3xl" />
          <div className="lg:col-span-5 space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[46px] font-bold leading-tight"
              aria-label="See the forces behind the news"
            >
              See the forces<br />behind the news
            </motion.h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md">
              NexVeris is AI-powered decision intelligence —
              revealing credibility gaps, incentive structures,
              and power dynamics <span className="font-medium">
              before narratives move outcomes</span>.
            </p>

            {/* Mini flow */}
            <div className="flex items-center gap-6 text-sm text-slate-700">
              <MiniStep icon={<FileText />} title="Paste" desc="Any public article" />
              <MiniStep icon={<Brain />} title="Analyze" desc="Bias & incentives" />
              <MiniStep icon={<Target />} title="Decide" desc="With structure" />
            </div>

            {/* Input */}
            <form onSubmit={handleAnalyzeNews} className="max-w-md">
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-2 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-800 transition-all">
                <LinkIcon className="ml-4 text-slate-400" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste article URL…"
                  aria-label="Article URL"
                  className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || (tier === "free" && (scansUsed || 0) >= 2)}
                  className="rounded-full px-7 py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-500 transition"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    (tier === "free" && (scansUsed || 0) >= 2) ? "Upgrade to analyze" : "Analyze article"
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
			  {/* Usage hint */}
<div className="mt-2 text-xs text-slate-500">
  {tier === "free" ? (
    <span>
      <strong>2 lifetime full intelligence analyses</strong>
      <span className="ml-2">
        Free: <strong>{Math.max(0, 2 - (scansUsed || 0))}</strong> / 2 analyses left
      </span>
      <span className="block text-slate-400">
        Includes all modules · No credit card required
      </span>

      {(scansUsed || 0) >= 2 && (
        <span className="block text-red-600 mt-1">
          Limit reached — upgrade for monthly access.
        </span>
      )}
    </span>
  ) : (
    <span>
      Monthly usage: <strong>{scansUsed}</strong> / {scansLimit}
    </span>
  )}
</div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleQuickPreview}
                  className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Show quick preview (Example)"
                >
                  Quick Preview (Example)
                </button>
              </div>
            </form>

            {quickPreview && (
              <div className="mt-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 max-w-md">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Quick Preview — {quickPreview.label}</div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="text-[10px] font-bold text-red-600 uppercase">Left</div>
                    <div className="text-xs text-red-700">Risk cues</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Center</div>
                    <div className="text-xs text-emerald-700">Balanced</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Right</div>
                    <div className="text-xs text-blue-700">Growth cues</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Bias score</span>
                    <span>{quickPreview.biasScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded">
                    <div
                      className="h-2 rounded bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500"
                      style={{ width: `${quickPreview.biasScore}%` }}
                      aria-label={`Bias score ${quickPreview.biasScore}/100`}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {quickPreview.drivers.map((d: any, i: number) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-full border ${
                        d.type === "upside"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-slate-500">Tickers (Example): {quickPreview.tickers.join(", ")}</div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 hidden lg:flex justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <HeroStackPreview />
            </motion.div>
          </div>
          {/* Mobile simplified preview */}
          <div className="lg:col-span-7 lg:hidden">
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900">
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">30-Second Summary</div>
                <div className="text-sm">Signal: Moderate · Drivers: Tech, Regulatory</div>
              </div>
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900">
                <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Market Cue</div>
                <div className="text-sm">Example tickers: AAA, BBB, CCC</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trending Analyses (Example) */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Trending Analyses</h3>
            <span className="text-xs text-slate-500">Example topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Semiconductor policy", "Energy transition", "Big tech antitrust", "Defense contracts"].map((t, i) => (
              <button
                key={i}
                className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setUrlInput(`https://example.com/${t.replace(/\s+/g, "-")}`);
                  handleQuickPreview();
                }}
                aria-label={`Preview topic ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>
        
        {/* ================= KEYWORD EXPANSION ================= */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold text-center mb-10">
            Who uses NexVeris and why
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              title="AI news analysis tool"
              desc="Analysts use NexVeris to turn dense reporting into structured credibility checks and incentive mapping."
            />
            <ValueCard
              title="Media bias detection"
              desc="Investigate framing and omissions to avoid narrative-driven decisions and identify persuasive tactics."
            />
            <ValueCard
              title="Market impact analysis"
              desc="Connect articles to equities and sectors with evidence-based signals and confidence levels."
            />
          </div>
          <p className="text-center text-slate-600 mt-10">
            NexVeris is an AI-powered decision intelligence platform — bridging credibility checks, hidden motives, stakeholder power, and market impact.
          </p>
        </section>
        {import.meta.env.VITE_SURVEY_URL && (
          <section className="mt-16">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-2">Help improve NexVeris</h2>
              <p className="text-slate-600 mb-4">Tell us if the page feels dense or overwhelming.</p>
              <iframe
                title="User Feedback Survey"
                src={import.meta.env.VITE_SURVEY_URL}
                className="w-full h-[480px] rounded-md border"
              />
            </div>
          </section>
        )}

        {/* ================= PROBLEM CONTEXT ================= */}
        <section className="mb-32">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why most decisions start with incomplete information
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <PainCard
              icon={<Search />}
              title="Credibility gaps"
              desc="Headlines omit uncertainty, assumptions, and missing counterparties."
            />
            <PainCard
              icon={<Scale />}
              title="Narrative bias"
              desc="Framing shapes interpretation before facts are fully processed."
            />
            <PainCard
              icon={<LineChart />}
              title="Late positioning"
              desc="By the time news trends, incentives are already priced in."
            />
          </div>
        </section>

        {/* ================= METHOD ================= */}
        <section className="bg-slate-50 dark:bg-slate-800/50 py-24 rounded-3xl mb-32">
          <h2 className="text-3xl font-bold text-center mb-10">
            A structured approach to news analysis
          </h2>
          <p className="text-center text-slate-600 mb-16">
            NexVeris does not predict outcomes — it clarifies structure and risk.
          </p>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            <Step title="Input" desc="Public news and disclosures" />
            <Step title="Decode" desc="Bias, incentives, stakeholder power" />
            <Step title="Interpret" desc="Market and decision implications" />
          </div>
        </section>

        {/* ================= VISUAL EVIDENCE ================= */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Who benefits — who absorbs the risk
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Stakeholder dominance and incentive alignment extracted directly
              from the article — not opinion or sentiment.
            </p>
            <p className="mt-4 font-medium">
              This layer is typically invisible in traditional reporting.
            </p>
          </div>

          <img
            src="/images/result-1.png"
            alt="Stakeholder incentive and power mapping"
            className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl"
          />
        </section>

        {/* ================= VALUE ================= */}
        <section className="mb-32 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            What NexVeris actually helps you avoid
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              title="Narrative-driven mistakes"
              desc="Avoid acting on strategically framed or incomplete information."
            />
            <ValueCard
              title="Delayed clarity"
              desc="Understand incentive structures before consensus forms."
            />
            <ValueCard
              title="Overconfidence"
              desc="Replace intuition with structured context."
            />
          </div>

          <p className="text-center text-slate-500 mt-10">
            NexVeris is not a news platform. It is a decision filter.
          </p>
        </section>

        {/* ================= FAQ ================= */}
        <section className="max-w-4xl mx-auto mb-32">
          <h2 className="text-3xl font-bold text-center mb-10">
            Common questions
          </h2>

          <div className="divide-y border-t border-b">
            {FAQS.map((f, i) => (
              <div key={i} className="py-6">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between text-left"
                >
                  <span className="font-semibold">{f.q}</span>
                  <ChevronDown className={openFaq === i ? "rotate-180" : ""} />
                </button>
                {openFaq === i && (
                  <p className="mt-4 text-slate-600">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Analyze one article. See the difference.
          </h2>
          <p className="text-slate-600 mb-8">
            Structure changes how information feels.
          </p>
          {limitReached ? (
            <button
              onClick={() => navigate("/pricing")}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500"
            >
              Upgrade to analyze
            </button>
          ) : (
            <button
              onClick={() => navigate("/analyze")}
              disabled={limitReached}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Analyze an article
            </button>
          )}
        </section>

        {/* ================= SEO SUPPORT BLOCK =================
            Purpose:
            - Reinforce topical authority
            - Connect homepage to all landing pages
            - Visible to Google, hidden from users
        ===================================================== */}
        <section className="sr-only">
          <h2>AI-powered News Analysis Platform</h2>
          <p>
            NexVeris is an AI-powered news analysis and decision intelligence
            platform that evaluates news credibility, detects bias, analyzes
            incentive structures, and assesses potential market impact.
          </p>
          <p>
            The platform is designed for investors, analysts, researchers,
            and decision-makers who need to understand not just what the news says,
            but why it is being said and how it may influence markets or behavior.
          </p>
          <ul>
            <li>AI News Analysis Tool</li>
            <li>News Credibility & Bias Detection</li>
            <li>Market Impact & Sentiment Analysis</li>
            <li>PESTLE & Geopolitical Risk Analysis</li>
          </ul>
        </section>

      </main>
    </div>
  );
}

/* ===== Small components ===== */

function MiniStep({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
  );
}

function PainCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl border bg-white dark:bg-white">
      <div className="mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-700">{desc}</p>
    </div>
  );
}

function Step({ title, desc }: any) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

function ValueCard({ title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl border bg-white dark:bg-white text-center">
      <ShieldCheck className="mx-auto mb-4 text-emerald-600" />
      <h3 className="text-xl font-semibold mb-2 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-700">{desc}</p>
    </div>
  );
}

const FAQS = [
  {
    q: "Is NexVeris opinionated?",
    a: "No. NexVeris does not take positions or generate opinions — it exposes structure, incentives, and narrative framing.",
  },
  {
    q: "Do you store or reuse my articles?",
    a: "No. Analysis is generated on demand and is not reused for training or redistribution.",
  },
  {
    q: "Who is NexVeris built for?",
    a: "Investors, analysts, researchers, and decision-makers who value context before action.",
  },
];
