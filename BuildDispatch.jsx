import { useState } from "react";

// ── Variety seeds: injected randomly so each pull explores fresh territory ──
const DOMAINS = [
  "personal finance & bills", "eldercare & aging parents", "small local businesses",
  "accessibility & disability", "mental health & burnout", "household logistics",
  "job hunting & careers", "education & studying", "healthcare navigation",
  "civic life & local government", "renters & housing", "newcomers & immigrants",
  "caregivers & parents", "freelancers & gig work", "personal safety & scams",
  "time & attention", "neighbourhood & community", "grief & life admin after a death",
  "chronic illness management", "language barriers", "food & nutrition on a budget",
];

const ANGLES = [
  "an agent that quietly watches for a deadline and acts before you forget",
  "an agent that turns a painful multi-step bureaucratic process into one conversation",
  "an agent that negotiates or chases on the user's behalf",
  "an agent that translates expert jargon into plain action for ordinary people",
  "an agent that catches a costly mistake before it happens",
  "an agent that does the boring research and hands back only the decision",
  "an agent that keeps a vulnerable person safe without being intrusive",
  "an agent that consolidates scattered accounts/documents into one clear picture",
];

function pick(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

const DIFFICULTY_META = {
  "Weekend": { tint: "var(--ok)", label: "WEEKEND BUILD" },
  "A few weeks": { tint: "var(--accent)", label: "A FEW WEEKENDS" },
  "Ambitious": { tint: "var(--deep)", label: "AMBITIOUS" },
};

export default function BuildDispatch() {
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [seen, setSeen] = useState([]);

  async function generate() {
    setLoading(true);
    setError(null);

    const domains = pick(DOMAINS, 2);
    const angle = pick(ANGLES, 1)[0];
    const avoid = seen.slice(-8);

    const system =
      "You are an idea engine for builders. You invent ONE concrete, buildable AI-agent project " +
      "that would be genuinely useful to a LARGE number of ordinary people — net positive, not a toy, " +
      "not a niche dev tool. The agent must actually DO things (take multi-step actions, watch for events, " +
      "fetch and reason, then act), not just chat. Favour ideas a solo builder could prototype. " +
      "Be specific and vivid; avoid buzzwords and avoid generic 'AI assistant for X' framing. " +
      "Respond with ONLY a raw JSON object, no markdown, no backticks, no preamble. Schema: " +
      '{"title": string (3-5 words, punchy, no "AI" in it), ' +
      '"tagline": string (one sharp sentence), ' +
      '"whoItHelps": string (the everyday people who benefit, ~1 sentence), ' +
      '"whatItDoes": string (2-3 sentences, concrete about the agentic loop: what it watches, decides, and does), ' +
      '"whyManyPeople": string (1-2 sentences on why this is broadly, net useful), ' +
      '"firstStep": string (the smallest thing to build first to prove it works), ' +
      '"stack": string (a short, practical suggested toolset), ' +
      '"difficulty": one of "Weekend" | "A few weeks" | "Ambitious"}';

    const user =
      `Invent one fresh agent idea. Lean toward these domains for inspiration (but don't force them): ` +
      `${domains.join(", ")}. Consider this angle: ${angle}. ` +
      (avoid.length
        ? `Do NOT repeat or closely resemble any of these already-seen ideas: ${avoid.join("; ")}.`
        : "");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          temperature: 1,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const data = await res.json();
      const raw = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(raw);
      setIdea(parsed);
      setSeen((s) => [...s, parsed.title]);
      setCount((c) => c + 1);
    } catch (e) {
      setError("The press jammed. Pull the lever again.");
    } finally {
      setLoading(false);
    }
  }

  const diff = idea && DIFFICULTY_META[idea.difficulty];

  return (
    <div className="bd-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,420&family=JetBrains+Mono:wght@500;700&display=swap');

        .bd-root{
          --paper:#f3ede1; --ink:#211d18; --muted:#736a5b;
          --line:#cdc2ac; --accent:#c5482e; --deep:#5a4632; --ok:#5e7a4f;
          min-height:100%;
          background:
            radial-gradient(120% 80% at 50% -10%, #f8f3e9 0%, var(--paper) 55%, #ece4d4 100%);
          color:var(--ink);
          font-family:'Newsreader',Georgia,serif;
          padding:34px 20px 46px;
          position:relative;
          overflow:hidden;
        }
        .bd-root::before{
          content:""; position:absolute; inset:0; pointer-events:none; opacity:.05; mix-blend-mode:multiply;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .bd-wrap{ max-width:600px; margin:0 auto; position:relative; }

        .bd-masthead{ text-align:center; border-bottom:2px solid var(--ink); padding-bottom:12px; }
        .bd-eyebrow{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.42em;
          color:var(--muted); text-transform:uppercase; margin-bottom:6px;
        }
        .bd-title{
          font-family:'Fraunces',serif; font-weight:600; font-size:clamp(36px,9vw,58px);
          line-height:.92; letter-spacing:-.02em; margin:0;
        }
        .bd-title em{ font-style:italic; color:var(--accent); font-weight:500; }
        .bd-sub{
          font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.28em;
          color:var(--muted); text-transform:uppercase; margin-top:9px;
          display:flex; justify-content:center; gap:14px; flex-wrap:wrap;
        }

        .bd-lever{
          display:block; width:100%; margin:26px 0 8px; cursor:pointer;
          background:var(--ink); color:var(--paper); border:none;
          font-family:'JetBrains Mono',monospace; font-weight:700; font-size:14px;
          letter-spacing:.16em; text-transform:uppercase; padding:18px;
          border-radius:3px; box-shadow:0 6px 0 #0b0907, 0 7px 14px rgba(0,0,0,.22);
          transition:transform .07s ease, box-shadow .07s ease;
        }
        .bd-lever:hover:not(:disabled){ transform:translateY(1px); box-shadow:0 5px 0 #0b0907,0 6px 12px rgba(0,0,0,.22); }
        .bd-lever:active:not(:disabled){ transform:translateY(6px); box-shadow:0 0 0 #0b0907,0 2px 6px rgba(0,0,0,.25); }
        .bd-lever:disabled{ cursor:wait; opacity:.62; }

        .bd-hint{ text-align:center; font-style:italic; color:var(--muted); font-size:15px; margin:6px 0 0; }

        /* ── printed card ── */
        .bd-card{
          margin-top:26px; background:#fbf7ee; border:1px solid var(--line);
          border-radius:4px; padding:30px 28px 26px; position:relative;
          box-shadow:0 1px 0 #fff inset, 0 18px 40px -22px rgba(40,30,15,.5);
        }
        .bd-card::after{
          content:""; position:absolute; inset:6px; border:1px solid var(--line);
          border-radius:2px; pointer-events:none; opacity:.6;
        }
        .bd-perf{ position:absolute; top:-1px; left:0; right:0; height:8px;
          background:radial-gradient(circle at 6px 8px, transparent 4px, var(--paper) 4.5px) repeat-x;
          background-size:14px 8px; }

        .reveal{ opacity:0; transform:translateY(8px); animation:rise .5s cubic-bezier(.2,.7,.2,1) forwards; }
        @keyframes rise{ to{ opacity:1; transform:none; } }

        .bd-stamp{
          display:inline-block; font-family:'JetBrains Mono',monospace; font-weight:700;
          font-size:10px; letter-spacing:.18em; padding:5px 10px; border-radius:2px;
          color:#fff; transform:rotate(-2.5deg); margin-bottom:14px;
        }
        .bd-name{
          font-family:'Fraunces',serif; font-weight:600; font-size:clamp(27px,6.4vw,38px);
          line-height:1.04; letter-spacing:-.015em; margin:0 0 8px;
        }
        .bd-tagline{ font-size:18px; line-height:1.45; color:var(--deep); font-style:italic; margin:0 0 20px; }

        .bd-field{ margin:15px 0; }
        .bd-flabel{
          font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:.26em;
          text-transform:uppercase; color:var(--accent); margin-bottom:4px;
        }
        .bd-ftext{ font-size:16.5px; line-height:1.5; color:var(--ink); margin:0; }

        .bd-rule{ height:1px; background:var(--line); margin:20px 0; }

        .bd-foot{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        @media(max-width:440px){ .bd-foot{ grid-template-columns:1fr; gap:14px; } }
        .bd-mono{ font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.5; color:var(--deep); }

        .bd-empty{
          margin-top:26px; text-align:center; padding:46px 24px; color:var(--muted);
          border:1px dashed var(--line); border-radius:4px; font-style:italic; font-size:16px;
        }
        .bd-err{ margin-top:18px; text-align:center; color:var(--accent); font-style:italic; }

        .bd-load{ display:inline-flex; gap:6px; align-items:center; }
        .bd-dot{ width:7px;height:7px;border-radius:50%;background:var(--paper);animation:blink 1s infinite; }
        .bd-dot:nth-child(2){animation-delay:.2s} .bd-dot:nth-child(3){animation-delay:.4s}
        @keyframes blink{ 0%,100%{opacity:.3} 50%{opacity:1} }
      `}</style>

      <div className="bd-wrap">
        <header className="bd-masthead">
          <div className="bd-eyebrow">For builders &middot; Useful to the many</div>
          <h1 className="bd-title">The Build <em>Dispatch</em></h1>
          <div className="bd-sub">
            <span>Agent ideas, freshly pressed</span>
            <span>No.&nbsp;{String(count).padStart(3, "0")}</span>
          </div>
        </header>

        <button className="bd-lever" onClick={generate} disabled={loading}>
          {loading ? (
            <span className="bd-load">
              Setting type
              <span className="bd-dot" /><span className="bd-dot" /><span className="bd-dot" />
            </span>
          ) : count === 0 ? (
            "Pull the lever"
          ) : (
            "Print another idea"
          )}
        </button>
        <p className="bd-hint">One press, one buildable agent idea worth shipping.</p>

        {error && <p className="bd-err">{error}</p>}

        {!idea && !loading && !error && (
          <div className="bd-empty">The press is loaded and inked.<br />Pull the lever to print your first idea.</div>
        )}

        {idea && !loading && (
          <article className="bd-card" key={count}>
            <div className="bd-perf" />
            {diff && (
              <div className="bd-stamp reveal" style={{ background: diff.tint, animationDelay: "0s" }}>
                {diff.label}
              </div>
            )}
            <h2 className="bd-name reveal" style={{ animationDelay: ".05s" }}>{idea.title}</h2>
            <p className="bd-tagline reveal" style={{ animationDelay: ".1s" }}>{idea.tagline}</p>

            <div className="bd-field reveal" style={{ animationDelay: ".16s" }}>
              <div className="bd-flabel">Who it helps</div>
              <p className="bd-ftext">{idea.whoItHelps}</p>
            </div>
            <div className="bd-field reveal" style={{ animationDelay: ".22s" }}>
              <div className="bd-flabel">What the agent does</div>
              <p className="bd-ftext">{idea.whatItDoes}</p>
            </div>
            <div className="bd-field reveal" style={{ animationDelay: ".28s" }}>
              <div className="bd-flabel">Why it&rsquo;s useful to many</div>
              <p className="bd-ftext">{idea.whyManyPeople}</p>
            </div>

            <div className="bd-rule reveal" style={{ animationDelay: ".32s" }} />

            <div className="bd-foot reveal" style={{ animationDelay: ".36s" }}>
              <div>
                <div className="bd-flabel">Build this first</div>
                <p className="bd-mono">{idea.firstStep}</p>
              </div>
              <div>
                <div className="bd-flabel">Suggested stack</div>
                <p className="bd-mono">{idea.stack}</p>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
