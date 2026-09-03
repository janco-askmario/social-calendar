import Link from "next/link";

const SECONDARY_FEATURES = [
  { title: "Realtime updates", desc: "Everyone sees changes the instant a teammate schedules or reschedules a post." },
  { title: "Drag & drop", desc: "Move posts between days, or resize their duration right on the grid." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-lg font-extrabold text-foreground">Social Media Calendar</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-foreground/80 hover:text-accent px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold rounded-xl bg-accent text-white px-4 py-2 hover:bg-accent-2 transition"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-foreground text-balance">
              Plan your team&apos;s social content, together.
            </h1>
            <p className="mt-5 text-lg text-muted max-w-lg">
              A soft, friendly, drag-and-drop calendar built for content teams — schedule posts
              across Instagram, Facebook, TikTok and LinkedIn, and see updates from your teammates
              in realtime.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group btn-spring flex items-center gap-1 rounded-full bg-accent text-white font-semibold pl-6 pr-2 py-2 hover:bg-accent-2"
              >
                Get started
                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </Link>
              <Link
                href="/demo"
                className="btn-spring text-sm font-semibold text-foreground/70 hover:text-accent px-2 py-2"
              >
                Try the demo →
              </Link>
            </div>
          </div>

          <div className="bg-panel rounded-[38px] border border-black/5 shadow-panel p-2.5">
            <div className="rounded-[30px] bg-background p-5 space-y-3 shadow-[inset_0_1px_3px_rgba(124,92,240,0.10)]">
              {[
                { platform: "Instagram", title: "Behind-the-Scenes", bg: "#FBE3EE", accent: "#F0A9CE" },
                { platform: "TikTok", title: "Product Teaser", bg: "#DCF3E8", accent: "#93D9B8" },
                { platform: "LinkedIn", title: "Case Study Post", bg: "#EBE3FB", accent: "#C6A6EF" },
              ].map((e) => (
                <div
                  key={e.platform}
                  className="flex items-center rounded-2xl overflow-hidden"
                  style={{ background: e.bg }}
                >
                  <div className="flex-1 px-4 py-3">
                    <p className="text-sm font-bold text-foreground/80">{e.platform}</p>
                    <p className="text-xs text-foreground/60">{e.title}</p>
                  </div>
                  <div className="w-2 self-stretch" style={{ background: e.accent }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 grid lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3 bg-panel rounded-[32px] border border-black/5 p-8">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Core</span>
            <h3 className="mt-3 text-2xl font-extrabold text-foreground text-balance">Shared calendar</h3>
            <p className="mt-3 text-muted max-w-md">
              One live calendar for the whole team — no more spreadsheets or duplicated posts.
            </p>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            {SECONDARY_FEATURES.map((f) => (
              <div key={f.title} className="flex-1 bg-panel rounded-[24px] border border-black/5 p-6">
                <h3 className="font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
