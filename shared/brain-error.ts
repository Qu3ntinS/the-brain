import {
	synapseCanvasInlineScript,
	synapseCanvasStyles,
} from './synapse-canvas'

export const brainErrorDefaults = {
	backHref: '/',
	backLabel: '← Back to The Brain',
	messages: {
		notFound: 'Not found',
	},
} as const

export const brainErrorStyles = `
    :root {
      --bg: #0d0221;
      --surface: #1a0a3e;
      --pink: #ff6bcb;
      --teal: #00f5d4;
      --text: #f8f4ff;
      --muted: #b8a9d9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: "DM Sans", system-ui, sans-serif;
      color: var(--text);
      background:
        radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 107, 203, 0.18), transparent 55%),
        radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0, 245, 212, 0.12), transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(255, 224, 102, 0.08), transparent 40%),
        var(--bg);
      display: grid;
      place-items: center;
      padding: 2rem;
    }
    ${synapseCanvasStyles}
    .card {
      width: min(100%, 28rem);
      text-align: center;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid rgba(255, 107, 203, 0.25);
      background: rgba(26, 10, 62, 0.85);
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
    }
    .code {
      font-family: "Syne", system-ui, sans-serif;
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, var(--text) 0%, var(--pink) 45%, var(--teal) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .message {
      color: var(--muted);
      margin: 1rem 0 1.5rem;
      line-height: 1.5;
    }
    .back {
      display: inline-flex;
      color: var(--teal);
      text-decoration: none;
      border: 1px solid rgba(0, 245, 212, 0.35);
      padding: 0.6rem 1rem;
      border-radius: 999px;
      font-size: 0.92rem;
      font-weight: 500;
    }
    @media (prefers-reduced-motion: reduce) {
      #synapses { display: none; }
    }
`

export const brainErrorPageHtml = (
	status: number,
	message: string,
	backHref = brainErrorDefaults.backHref,
	backLabel = brainErrorDefaults.backLabel,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${status} — The Brain</title>
  <link rel="icon" href="/assets/brain-logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet" />
  <style>${brainErrorStyles}</style>
</head>
<body>
  <canvas id="synapses" aria-hidden="true"></canvas>
  <div class="card">
    <div class="code">${status}</div>
    <p class="message">${message}</p>
    <a class="back" href="${backHref}">${backLabel}</a>
  </div>
  <script>${synapseCanvasInlineScript}<\/script>
</body>
</html>`
