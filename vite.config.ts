import { defineConfig, type Plugin } from 'vite'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ORIGINE = process.env.SITE_URL ?? 'https://morphologie.commutator.io'

// One HTML page per view. The same table serves the build and the sitemap.
// The vocabulary sits at the root: it is the tool one opens in class, not an
// appendix to the list of sessions.
const PAGES = {
  main: 'index.html',
  references: 'references/index.html',
  digressions: 'digressions/index.html',
  seances: 'seances/index.html',
  lignee: 'lignee/index.html',
  methode: 'methode/index.html',
  mentions: 'mentions/index.html',
} as const

/**
 * Old addresses, kept alive.
 *
 * The digressions tab first lived under `/anecdotes/`. The word promised a
 * garland of witticisms, so the URL followed the label — but links may have
 * been shared meanwhile, and static hosting cannot redirect server-side. A
 * forwarding page does the job: it costs under a kilobyte and keeps a link
 * handed to students off a 404.
 *
 * Held apart from the pages: they build like them, but have no place in the
 * sitemap, which must announce one address per piece of content.
 */
const REDIRECTIONS = {
  anecdotes: 'anecdotes/index.html',
} as const

/**
 * Date of the last commit, ISO — the header and the index are shared, so any
 * commit can change any page. Without a git repository we write no date rather
 * than invent one.
 */
function dernierCommit(): string | null {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], {
      cwd: import.meta.dirname,
      encoding: 'utf8',
    }).trim()
  } catch {
    return null
  }
}

/** Writes sitemap.xml and robots.txt from PAGES, during the build. */
function planDuSite(): Plugin {
  return {
    name: 'plan-du-site',
    apply: 'build',
    generateBundle() {
      const modifie = dernierCommit()
      const url = (page: string) => {
        const chemin = page === 'index.html' ? '/' : `/${page.replace(/index\.html$/, '')}`
        return [
          '  <url>',
          `    <loc>${ORIGINE}${chemin}</loc>`,
          ...(modifie ? [`    <lastmod>${modifie}</lastmod>`] : []),
          '  </url>',
        ].join('\n')
      }
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...Object.values(PAGES).map(url),
          '</urlset>',
          '',
        ].join('\n'),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nSitemap: ${ORIGINE}/sitemap.xml\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), planDuSite()],
  // GitHub Pages serves a project site under /<repo>/; on a dedicated domain the
  // root is enough, and the workflow leaves BASE_PATH empty.
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries({ ...PAGES, ...REDIRECTIONS }).map(([cle, page]) => [
          cle,
          resolve(import.meta.dirname, page),
        ]),
      ),
    },
  },
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
})
