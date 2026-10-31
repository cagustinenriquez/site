// Install shortcuts from an app's latest GitHub release, so the Apps page stays current
// without editing version numbers. Uses the public GitHub API (no token needed).

export type Platform = 'mac' | 'snap' | 'windows'

export interface Installer {
  platform: Platform
  label: string
  href: string
}

interface ReleaseAsset {
  name: string
  browser_download_url: string
}

// Which release files get a button, and what it says. Anything else (zips, blockmaps)
// stays on the full releases page.
function toInstaller(asset: ReleaseAsset): Installer | null {
  const name = asset.name.toLowerCase()
  const href = asset.browser_download_url
  if (name.endsWith('.dmg')) {
    if (name.includes('arm64')) return { platform: 'mac', label: 'macOS (Apple Silicon)', href }
    if (name.includes('x64')) return { platform: 'mac', label: 'macOS (Intel)', href }
    return { platform: 'mac', label: 'macOS', href }
  }
  if (name.endsWith('.snap')) return { platform: 'snap', label: 'Snap', href }
  if (name.endsWith('.exe')) {
    if (name.includes('arm64')) return { platform: 'windows', label: 'Windows (ARM)', href }
    return { platform: 'windows', label: 'Windows', href }
  }
  return null
}

export async function getInstallers(repo: string, snapStore?: string): Promise<Installer[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  // 404 means the repo has no releases yet: no buttons, not an error
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GitHub releases: ${res.status}`)

  const { assets = [] } = (await res.json()) as { assets?: ReleaseAsset[] }
  const installers = assets.map(toInstaller).filter((i): i is Installer => i !== null)

  // The Snap Store page beats a raw .snap file: it shows the install command and updates itself
  if (snapStore) {
    const store = { platform: 'snap' as const, label: 'Snap Store', href: `https://snapcraft.io/${snapStore}` }
    return [store, ...installers.filter((i) => i.platform !== 'snap')]
  }
  return installers
}
