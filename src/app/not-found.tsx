import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center bg-panel rounded-[38px] border border-black/5 shadow-panel p-10">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">404</span>
        <h1 className="mt-3 text-2xl font-extrabold text-foreground text-balance">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-2 text-sm text-muted">
          The link may be broken, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-accent text-white font-semibold text-sm px-5 py-2.5 hover:bg-accent-2 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
