export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold text-ink">SIM Latinoamérica</h1>
      <p className="max-w-md text-muted">
        Next.js scaffold — homepage rebuild lands in Phase 2. See{" "}
        <code className="text-brand">docs/nextjs-migration-analysis.md</code>{" "}
        and the reference POC in <code className="text-brand">poc/</code>.
      </p>
    </main>
  );
}
