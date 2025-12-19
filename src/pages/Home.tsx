import { Helmet } from "react-helmet-async";
import { useState } from "react";
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

  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3005";

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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ================= SEO HEAD ================= */}
      <Helmet>
        <title>AI News Analysis for Credibility & Market Impact | NexVeris</title>
        <meta
          name="description"
          content="NexVeris is an AI-powered news analysis platform that reveals credibility, bias, hidden incentives, and market impact behind news events."
        />
      </Helmet>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">

        {/* ================= HERO ================= */}
        <section className="grid lg:grid-cols-12 gap-16 items-center mb-32">
          <div className="lg:col-span-5 space-y-8">
            <h1 className="text-[46px] font-bold leading-tight">
              See the forces<br />behind the news
            </h1>

            <p className="text-lg text-slate-600 max-w-md">
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
              <div className="flex items-center bg-white rounded-full p-2 border shadow-sm">
                <LinkIcon className="ml-4 text-slate-400" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste article URL…"
                  className="flex-1 bg-transparent px-4 py-3 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full px-7 py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-500 transition"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Analyze article"
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </form>
          </div>

          <div className="lg:col-span-7 hidden lg:flex justify-center">
            <HeroStackPreview />
          </div>
        </section>

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
        <section className="bg-slate-50 py-24 rounded-3xl mb-32">
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
            <p className="text-lg text-slate-600">
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
            className="rounded-2xl border shadow-xl"
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
          <button
            onClick={() => navigate("/analyze")}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500"
          >
            Analyze an article
          </button>
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
    <div className="p-8 rounded-2xl border bg-white">
      <div className="mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Step({ title, desc }: any) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}

function ValueCard({ title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl border bg-white text-center">
      <ShieldCheck className="mx-auto mb-4 text-emerald-600" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
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
