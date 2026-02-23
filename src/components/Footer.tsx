export default function Footer() {
    return (
<footer className="w-full border-t py-6 bg-white dark:bg-zinc-900 dark:border-zinc-700">
    <div className="max-w-7xl mx-auto px-6 relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-300">
        © 2026 MiniShop
      </span>
      <div className="flex justify-center gap-4">
        <a
          href="https://alejosworkstuff.github.io/portfolio/"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
          target="_blank" rel="noopener noreferrer"
        >
          Portfolio
        </a>
        <span className="separator">•</span>
        <a
          href="https://github.com/alejosworkstuff"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
          target="_blank" rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
</footer>
    );
}