import { useQuery } from '@tanstack/react-query'
import { Code, Download, Laptop, Monitor, Package } from 'lucide-react'
import { CyberCity } from '@/components/CyberCity'
import { projects, type Project } from '@/content/profile'
import { getInstallers, type Platform } from '@/lib/releases'
import { useReveal, stagger } from '@/lib/useReveal'
import './blog.css'

const platformIcon: Record<Platform, typeof Laptop> = { mac: Laptop, snap: Package, windows: Monitor }

// Download buttons: one per installer in the latest GitHub release, then the full list.
// While loading, or if GitHub can't be reached, only the full list shows.
function AppDownloads({ app }: { app: Project }) {
  const { data: installers = [] } = useQuery({
    queryKey: ['installers', app.releases, app.snapStore],
    queryFn: () => getInstallers(app.releases!, app.snapStore),
    enabled: !!app.releases,
    staleTime: 1000 * 60 * 30,
  })

  return (
    <>
      {installers.map((inst) => {
        const Icon = platformIcon[inst.platform]
        return (
          <a key={inst.href} className="blog-btn blog-btn-accent" href={inst.href} target="_blank" rel="noreferrer">
            <Icon size={16} /> {inst.label}
          </a>
        )
      })}
      {app.download && (
        <a className="blog-btn" href={app.download} target="_blank" rel="noreferrer">
          <Download size={16} /> {installers.length ? 'All downloads' : 'Download'}
        </a>
      )}
    </>
  )
}

// Apps Agustin has built. Same list m0tz's chat uses (src/content/profile.ts), newest first.
export function Apps() {
  useReveal()

  return (
    <>
      <CyberCity calm />
      <main className="blog-shell">
        <header className="blog-header">
          <p className="section-kicker">Things I've summoned</p>
          <h1 className="blog-title">Apps</h1>
        </header>

        <div className="blog-grid">
          {projects.map((app, i) => (
            <article key={app.name} className="blog-card blog-glass app-card reveal" style={stagger(Math.min(i, 4))}>
              <div className="app-card-head">
                {app.icon && <img className="app-icon" src={app.icon} alt="" width={48} height={48} />}
                <h2 className="blog-card-title">{app.name}</h2>
                {i === 0 && <span className="app-badge">Latest</span>}
              </div>

              <p className="blog-card-excerpt">{app.summary}</p>

              {app.tags && app.tags.length > 0 && (
                <div className="blog-tags">
                  {app.tags.map((tag) => (
                    <span key={tag} className="blog-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="app-links">
                <AppDownloads app={app} />
                <a className="blog-btn" href={app.url} target="_blank" rel="noreferrer">
                  <Code size={16} /> Source
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}

export default Apps
