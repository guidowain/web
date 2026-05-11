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

async function getRemoteSha(filePath: string) {
  const { repo, branch } = getGithubConfig()
  const url = buildGithubContentsUrl(repo, filePath, branch)

  try {
    const data = await githubRequest<GithubContentResponse>(url)
    return data.sha
  } catch (error) {
    if (error instanceof Error && error.message.includes('GitHub API error 404')) {
      return undefined
    }

    throw error
  }
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

export async function saveFilesToGithub(files: GithubFilePayload[]) {
  const { repo, branch } = getGithubConfig()

  for (const file of files) {
    const sha = await getRemoteSha(file.path)
    const url = buildGithubContentsUrl(repo, file.path)

    await githubRequest(url, {
      method: 'PUT',
      body: JSON.stringify({
        branch,
        message: `Update site content: ${file.path}`,
        content: file.contentBase64,
        ...(sha ? { sha } : {}),
      }),
    })
  }
}
