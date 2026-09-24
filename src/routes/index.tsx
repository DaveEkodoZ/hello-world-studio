import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

const TITLE = "Joyeux Anniversaire, Madame YAKANA Carole !";
const DESC = "Une lettre ouverte interactive pour l'anniversaire de Madame YAKANA Carole, Directrice de la CSI – CUY.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const BALLOON_COLORS = ["var(--rose)", "var(--gold)", "var(--primary)", "var(--accent)", "var(--ok)"];

type B = { id: number; left: number; size: number; color: string; dur: number };

function Balloon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 50 80" aria-hidden>
      <ellipse cx="25" cy="24" rx="20" ry="24" fill={color} opacity="0.9" />
      <ellipse cx="18" cy="15" rx="5" ry="8" fill="var(--card)" opacity="0.35" />
      <path d="M22 47 L28 47 L25 52 Z" fill={color} />
      <path d="M25 52 Q20 62 26 70 Q30 76 24 80" stroke="var(--muted-foreground)" strokeWidth="1" fill="none" />
    </svg>
  );
}

function BalloonLayer() {
  const [balloons, setBalloons] = useState<B[]>([]);
  const idRef = useRef(0);
  const lastY = useRef(0);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const spawn = (n: number) => {
      const fresh: B[] = Array.from({ length: n }, () => ({
        id: idRef.current++,
        left: Math.random() * 95,
        size: 30 + Math.random() * 35,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        dur: 7 + Math.random() * 5,
      }));
      setBalloons((b) => [...b.slice(-30), ...fresh]);
    };
    spawn(6);
    const onScroll = () => {
      const y = window.scrollY;
      const now = Date.now();
      if (Math.abs(y - lastY.current) > 120 && now - lastSpawn.current > 350) {
        spawn(Math.random() > 0.5 ? 2 : 1);
        lastY.current = y;
        lastSpawn.current = now;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon-rise absolute"
          style={{ left: `${b.left}%`, bottom: -120, ["--dur" as string]: `${b.dur}s` }}
          onAnimationEnd={() => setBalloons((all) => all.filter((x) => x.id !== b.id))}
        >
          <Balloon size={b.size} color={b.color} />
        </div>
      ))}
    </div>
  );
}

function fireConfetti() {
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "50" });
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const colors = ["--rose", "--gold", "--primary", "--ok", "--accent"].map((v) => css.getPropertyValue(v));
  const parts = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.6,
    vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6,
    r: Math.random() * 6 + 3, c: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * 6,
  }));
  let t = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach((p) => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += 0.1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
    });
    if (++t < 200) requestAnimationFrame(tick); else canvas.remove();
  };
  tick();
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add("in"), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{children}</span>;
}

const CORE = [
  { fn: "integrerEquipe()", title: "Merci de m'avoir accueilli", text: "Un immense merci de m'avoir accepté au sein de votre équipe, même si je ne suis actuellement qu'un stagiaire." },
  { fn: "mentorat.global()", title: "Merci pour vos conseils", text: "Merci pour vos précieux conseils, qu'ils soient sur le plan technique, professionnel, religieux ou sur la vie en général." },
  { fn: "soin.maternel()", title: "Merci d'être là quand ça ne va pas", text: "Quand je suis souvent souffrant, vous veillez à me donner des soins, des médicaments… Vous êtes une vraie seconde maman pour moi." },
  { fn: "lancer(opportunite)", title: "Merci pour votre confiance", text: "Merci pour les opportunités et les lancements que vous me confiez régulièrement." },
];

const STACK = [
  { key: "API Status", status: "200 OK · uptime 100%", text: "Connexion permanente à votre bienveillance et à vos conseils." },
  { key: "Protocoles de Sécurité", status: "TLS maternel · actif", text: "Votre soutien maternel et vos soins lors des moments de fatigue ou de maladie." },
  { key: "Deployments / Lancements", status: "prod · en progression", text: "Les opportunités professionnelles que vous me confiez et qui me permettent de progresser." },
];

function Index() {
  const [committed, setCommitted] = useState(false);

  return (
    <main className="relative">
      <BalloonLayer />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-24">
        <div className="absolute right-[8%] top-[14%] balloon-sway hidden md:block"><Balloon size={70} color="var(--rose)" /></div>
        <div className="absolute left-[7%] top-[30%] balloon-sway hidden md:block" style={{ animationDelay: "1.5s" }}><Balloon size={55} color="var(--gold)" /></div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="mb-6 inline-block rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs text-muted-foreground">
              GET <span className="text-primary">/fete</span> → <span className="text-ok">200 OK</span>
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="font-display text-5xl leading-[1.05] text-primary sm:text-7xl md:text-8xl">
              Joyeux Anniversaire,
              <br />
              <em className="text-gold">Madame YAKANA Carole</em> !
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-6 font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground">Directrice de la CSI · CUY — Mairie de Yaoundé</p>
          </Reveal>
          <Reveal delay={450}>
            <blockquote className="mx-auto mt-12 max-w-2xl font-display text-xl italic leading-relaxed text-foreground sm:text-2xl">
              « Vous avez été la première à croire en moi et à me mettre à l'aise lorsque je m'exprime en public. Aujourd'hui, je me débrouille tant bien que mal et il y a une vraie évolution, et c'est en grande partie grâce à vous. »
            </blockquote>
          </Reveal>
          <Reveal delay={600}>
            <p className="mt-14 font-mono text-xs text-muted-foreground">faites défiler pour laisser s'envoler les ballons ↓</p>
          </Reveal>
        </div>
      </section>

      {/* CORE MODULE */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Tag>02 · Core Module</Tag>
            <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Le code source de ma reconnaissance</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CORE.map((c, i) => (
              <Reveal key={c.fn} delay={i * 120}>
                <article className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <code className="font-mono text-sm text-rose">merci.{c.fn}</code>
                  <h3 className="mt-3 font-display text-2xl text-primary">{c.title}</h3>
                  <p className="mt-3 leading-relaxed text-foreground/85">{c.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Tag>03 · Tech Stack</Tag>
            <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Le tableau de bord de votre impact</h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-12 overflow-hidden rounded-2xl bg-terminal text-terminal-foreground shadow-xl">
              <div className="flex items-center gap-2 border-b border-terminal-foreground/10 px-5 py-3">
                <span className="h-3 w-3 rounded-full bg-rose" />
                <span className="h-3 w-3 rounded-full bg-gold" />
                <span className="h-3 w-3 rounded-full bg-ok" />
                <span className="ml-3 font-mono text-xs opacity-60">gateway.carole-yakana.cuy/status</span>
              </div>
              <div className="divide-y divide-terminal-foreground/10">
                {STACK.map((s) => (
                  <div key={s.key} className="grid gap-2 px-6 py-6 md:grid-cols-[1fr_2fr] md:gap-8">
                    <div>
                      <p className="font-mono text-sm text-gold">[{s.key}]</p>
                      <p className="mt-1 flex items-center gap-2 font-mono text-xs text-ok">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-ok" /> {s.status}
                      </p>
                    </div>
                    <p className="leading-relaxed opacity-90">{s.text}</p>
                  </div>
                ))}
              </div>
              <p className="px-6 py-4 font-mono text-xs opacity-60">
                $ ping bienveillance → réponse en 0 ms, à chaque fois<span className="caret">▍</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* COMMIT FINAL */}
      <footer className="relative z-10 px-6 pb-32 pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Tag>04 · Commit Final</Tag>
            <p className="mt-8 font-display text-2xl leading-relaxed text-primary sm:text-3xl">
              Sachez que vous comptez énormément pour moi. Je vous souhaite un merveilleux anniversaire, rempli de santé, de joies et de réussite.
            </p>
            <p className="mt-6 font-display text-3xl italic text-gold sm:text-4xl">Merci pour tout, du fond du cœur.</p>
          </Reveal>
          <Reveal delay={200}>
            <button
              onClick={() => { fireConfetti(); setCommitted(true); }}
              className="mt-12 rounded-full bg-primary px-8 py-4 font-mono text-sm text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              git commit -m "Joyeux anniversaire 🎉"
            </button>
            {committed && (
              <p className="mt-4 font-mono text-xs text-muted-foreground">✓ commit envoyé en production — avec toute ma gratitude</p>
            )}
          </Reveal>
        </div>
      </footer>
    </main>
  );
}
