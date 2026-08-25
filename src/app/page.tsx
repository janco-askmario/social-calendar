import Link from "next/link";

const FEATURES = [
  { title: "Shared calendar", desc: "One live calendar for the whole team — no more spreadsheets or duplicated posts." },
  { title: "Realtime updates", desc: "Everyone sees changes the instant a teammate schedules or reschedules a post." },
  { title: "Drag & drop", desc: "Move posts between days or resize their duration right on the grid." },
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

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-foreground">
              Plan your team&apos;s social content, together.
            </h1>
            <p className="mt-5 text-lg text-muted max-w-lg">
              A soft, friendly, drag-and-drop calendar built for content teams — schedule posts
              across Instagram, Facebook, TikTok and LinkedIn, and see updates from your teammates
              in realtime.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-accent text-white font-semibold px-6 py-3 hover:bg-accent-2 transition"
              >
                Get started
              </Link>
              <Link
                href="/demo"
                className="rounded-xl bg-white border border-black/10 text-foreground font-semibold px-6 py-3 hover:border-accent/40 transition"
              >
                Try the demo →
              </Link>
            </div>
          </div>

          <div className="bg-panel rounded-[38px] border border-black/5 shadow-sm p-6">
            <div className="rounded-[24px] bg-background p-5 space-y-3">
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

        <div className="mt-20 grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-panel rounded-[28px] border border-black/5 p-6">
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
