import { brainBaseStyles } from '../shared/brain-styles'
import { sessionClientScript } from '../shared/session-client'

export const landingPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Brain — Quentin's personal API hub</title>
  <link rel="icon" href="/assets/brain-logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet" />
  <style>
${brainBaseStyles}

    canvas#synapses {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0.7;
    }

    .logo-wrap {
      width: min(280px, 52vw);
      height: min(280px, 52vw);
      margin-bottom: 0.25rem;
      animation: logo-idle 4s ease-in-out infinite;
      filter: drop-shadow(0 0 32px rgba(255, 107, 203, 0.4));
    }

    .logo {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    @keyframes logo-idle {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.025); }
    }

    @media (prefers-reduced-motion: reduce) {
      .logo-wrap { animation: none; }
    }

    .wrap {
      position: relative;
      z-index: 2;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 3rem 1.5rem 2rem;
      max-width: 960px;
      margin: 0 auto;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      border: 1px solid rgba(0, 245, 212, 0.35);
      background: rgba(26, 10, 62, 0.7);
      color: var(--teal);
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      animation: float 4s ease-in-out infinite;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--teal);
      box-shadow: 0 0 12px var(--teal);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    main {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 2rem 0;
    }

    h1 {
      font-family: "Syne", sans-serif;
      font-size: clamp(3rem, 12vw, 6.5rem);
      font-weight: 800;
      line-height: 0.95;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--text) 0%, var(--pink) 45%, var(--teal) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 0 40px rgba(255, 107, 203, 0.25));
    }

    .tagline {
      font-size: clamp(1.05rem, 3vw, 1.35rem);
      color: var(--muted);
      max-width: 34ch;
      line-height: 1.6;
    }

    .tagline em {
      color: var(--gold);
      font-style: normal;
      font-weight: 500;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 0.5rem;
    }

    footer {
      text-align: center;
      font-size: 0.9rem;
      color: var(--muted);
      padding-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="bg"></div>
  <canvas id="synapses" aria-hidden="true"></canvas>

  <div class="wrap">
    <div class="badge">
      <span class="badge-dot"></span>
      personal api · central hub
    </div>

    <main>
      <div class="logo-wrap">
        <img
          class="logo"
          src="/assets/brain-logo.png"
          alt="The Brain mascot"
          width="280"
          height="280"
        />
      </div>
      <h1>The Brain</h1>
      <p class="tagline">
        The Brain for <em>everything</em> I build.
      </p>

      <div class="actions">
        <a class="btn btn-primary is-hidden" id="nav-docs" href="/docs">Docs</a>
        <a class="btn btn-ghost" id="nav-login" href="/login">Log in</a>
        <a class="btn btn-ghost" href="/api/health">Health check</a>
      </div>
    </main>

    <footer>Crafted with ❤️ by Quentin</footer>
  </div>

  <script>
    (function () {
      const canvas = document.getElementById("synapses");
      const ctx = canvas.getContext("2d");
      const nodes = [];
      const count = 42;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      window.addEventListener("resize", resize);
      resize();

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 1,
        });
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
          if (a.y < 0 || a.y > canvas.height) a.vy *= -1;

          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 107, 203, 0.85)";
          ctx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = "rgba(0, 245, 212, " + (1 - dist / 120) * 0.35 + ")";
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        requestAnimationFrame(draw);
      }

      draw();
    })();
  </script>
  <script>${sessionClientScript}</script>
</body>
</html>`
