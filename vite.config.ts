import { defineConfig, type Plugin } from 'vite'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ORIGINE = process.env.SITE_URL ?? 'https://morphologie.commutator.io'

// Une page HTML par vue. La même table sert au build et au plan du site.
// Le vocabulaire est à la racine : c'est l'outil qu'on ouvre en cours, et non
// une annexe de la liste des séances.
const PAGES = {
  main: 'index.html',
  references: 'references/index.html',
  anecdotes: 'anecdotes/index.html',
  seances: 'seances/index.html',
  lignee: 'lignee/index.html',
  methode: 'methode/index.html',
} as const

/** Date du dernier commit, en ISO — l'en-tête et l'index sont partagés, donc
 *  n'importe quel commit peut modifier n'importe quelle page. Sans dépôt git,
 *  on n'écrit pas de date plutôt que d'en inventer une. */
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

/** Écrit sitemap.xml et robots.txt à partir de PAGES, pendant le build. */
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
  // GitHub Pages sert un site de projet sous /<dépôt>/ ; sur un domaine dédié
  // la racine suffit, et le workflow laisse BASE_PATH vide.
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(PAGES).map(([cle, page]) => [cle, resolve(import.meta.dirname, page)]),
      ),
    },
  },
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
})
