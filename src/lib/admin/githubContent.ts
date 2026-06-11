type GithubFilePayload = {
  path: string
  contentBase64: string
}

type GithubContentResponse = {
  sha?: string
  content?: string
  encoding?: string
}

const githubApiBase = 'https://api.github.com'

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, '')
}

function normalizeGithubRepo(value: string | undefined) {
  const rawRepo = cleanEnvValue(value)
  if (!rawRepo) return undefined

  const repo = rawRepo
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .replace(/^\/+|\/+$/g, '')

  if (!/^[\w.-]+(\/[\w.-]+)?$/.test(repo)) {
    throw new Error('Invalid GITHUB_REPO. Use repo or owner/repo, for example web or guidowain/web.')
  }

  return repo
}

function getGithubConfig() {
  const owner = cleanEnvValue(process.env.GITHUB_OWNER) || 'guidowain'
  const configuredRepo = normalizeGithubRepo(process.env.GITHUB_REPO) || 'web'
  const repo = configuredRepo.includes('/') ? configuredRepo : `${owner}/${configuredRepo}`
  const token = cleanEnvValue(process.env.GITHUB_TOKEN) || cleanEnvValue(process.env.GITHUB_CONTENT_TOKEN)
  const branch = cleanEnvValue(process.env.GITHUB_BRANCH) || 'main'

  if (!token) {
    throw new Error('Missing GITHUB_TOKEN or GITHUB_CONTENT_TOKEN')
  }

  return { repo, token, branch }
}

async function githubRequest<T>(url: string, init: RequestInit = {}) {
  const { token } = getGithubConfig()
  let response: Response

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...init.headers,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error.'
    throw new Error(`GitHub request could not be sent. Check GITHUB_REPO and GITHUB_TOKEN. Detail: ${message}`)
  }

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${detail}`)
  }

  return response.json() as Promise<T>
}

function buildGithubContentsUrl(repo: string, filePath: string, branch?: string) {
  const url = new URL(
    `${githubApiBase}/repos/${repo}/contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`,
  )

  if (branch) {
    url.searchParams.set('ref', branch)
  }

  return url.toString()
}

export async function getFileFromGithub(filePath: string) {
  const { repo, branch } = getGithubConfig()
  const url = buildGithubContentsUrl(repo, filePath, branch)
  const data = await githubRequest<GithubContentResponse>(url, { cache: 'no-store' })

  if (!data.content || data.encoding !== 'base64') {
    throw new Error(`GitHub file ${filePath} did not return base64 content.`)
  }

  return Buffer.from(data.content.replace(/\s/g, ''), 'base64')
}

type GithubDirEntry = {
  name: string
  type: string
}

export async function listDirFromGithub(dirPath: string) {
  const { repo, branch } = getGithubConfig()
  const url = buildGithubContentsUrl(repo, dirPath, branch)
  const data = await githubRequest<GithubDirEntry[] | GithubContentResponse>(url, { cache: 'no-store' })

  if (!Array.isArray(data)) {
    throw new Error(`GitHub path ${dirPath} is not a directory.`)
  }

  return data.filter((entry) => entry.type === 'file').map((entry) => entry.name)
}

// Un solo commit atómico vía Git Data API (blobs → tree → commit → ref).
// La actualización del ref es fast-forward: si hubo una escritura concurrente, falla en vez de pisarla.
export async function saveFilesToGithub(files: GithubFilePayload[]) {
  if (files.length === 0) return

  const { repo, branch } = getGithubConfig()
  const gitBase = `${githubApiBase}/repos/${repo}/git`

  const ref = await githubRequest<{ object: { sha: string } }>(`${gitBase}/ref/heads/${branch}`, { cache: 'no-store' })
  const headSha = ref.object.sha
  const headCommit = await githubRequest<{ tree: { sha: string } }>(`${gitBase}/commits/${headSha}`, { cache: 'no-store' })

  const treeEntries = await Promise.all(
    files.map(async (file) => {
      const blob = await githubRequest<{ sha: string }>(`${gitBase}/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: file.contentBase64, encoding: 'base64' }),
      })
      return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha }
    }),
  )

  const tree = await githubRequest<{ sha: string }>(`${gitBase}/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeEntries }),
  })

  const message = files.length === 1
    ? `Update site content: ${files[0].path}`
    : `Update site content (${files.length} archivos)`

  const commit = await githubRequest<{ sha: string }>(`${gitBase}/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  })

  await githubRequest(`${gitBase}/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  })
}
