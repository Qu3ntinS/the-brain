const prefersHtml = (accept: string | null) => {
	if (!accept) return false
	if (accept.includes('application/json')) return false
	return accept.includes('text/html') || accept.includes('*/*')
}

export const apiErrorPageHtml = (status: number, message: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${status} — The Brain API</title>
  <link rel="icon" href="/assets/brain-logo.png" type="image/png" />
  <style>
    :root {
      --bg: #0d0221;
      --pink: #ff6bcb;
      --teal: #00f5d4;
      --text: #f8f4ff;
      --muted: #b8a9d9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 107, 203, 0.18), transparent 55%),
        radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0, 245, 212, 0.12), transparent 50%),
        var(--bg);
      display: grid;
      place-items: center;
      padding: 2rem;
    }
    .card {
      max-width: 28rem;
      text-align: center;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 203, 0.25);
      background: rgba(26, 10, 62, 0.85);
    }
    .code {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--text), var(--pink), var(--teal));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    p { color: var(--muted); margin: 1rem 0 1.5rem; line-height: 1.5; }
    a {
      color: var(--teal);
      text-decoration: none;
      border: 1px solid rgba(0, 245, 212, 0.35);
      padding: 0.6rem 1rem;
      border-radius: 999px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">${status}</div>
    <p>${message}</p>
    <a href="/">← Back to The Brain</a>
  </div>
</body>
</html>`

export const mapApiError = (code: number | string, error: unknown) => {
	const status = typeof code === 'number' ? code : 500
	const message =
		error instanceof Error
			? error.message
			: typeof error === 'object' &&
				  error &&
				  'message' in error &&
				  typeof error.message === 'string'
				? error.message
				: 'Something went wrong'

	return { status, message }
}

export const apiErrorHandler = ({
	code,
	error,
	set,
	request,
}: {
	code: number | string
	error: unknown
	set: { status?: number | string; headers: Record<string, string> }
	request: Request
}) => {
	const { status, message } = mapApiError(code, error)
	set.status = status

	if (!prefersHtml(request.headers.get('accept'))) {
		return {
			error: status === 401 ? 'Unauthorized' : 'Error',
			message,
		}
	}

	set.headers['content-type'] = 'text/html; charset=utf-8'
	return apiErrorPageHtml(status, message)
}
