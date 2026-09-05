import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="underline">
        Back to home
      </Link>
    </main>
  );
}
