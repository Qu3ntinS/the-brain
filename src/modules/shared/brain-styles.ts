export const brainBaseStyles = `
    :root {
      --bg: #0d0221;
      --surface: #1a0a3e;
      --pink: #ff6bcb;
      --teal: #00f5d4;
      --gold: #ffe066;
      --text: #f8f4ff;
      --muted: #b8a9d9;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      font-family: "DM Sans", system-ui, sans-serif;
      color: var(--text);
      background: var(--bg);
      overflow-x: hidden;
    }

    .bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      background:
        radial-gradient(ellipse 80% 50% at 20% 20%, rgba(255, 107, 203, 0.18), transparent 55%),
        radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0, 245, 212, 0.12), transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(255, 224, 102, 0.08), transparent 40%),
        var(--bg);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 1.25rem;
      border-radius: 999px;
      font-size: 0.92rem;
      font-weight: 500;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--pink), #c44dff);
      color: #fff;
      box-shadow: 0 8px 32px rgba(255, 107, 203, 0.35);
    }

    .btn-primary:hover {
      transform: scale(1.04);
      box-shadow: 0 12px 40px rgba(255, 107, 203, 0.5);
    }

    .btn-ghost {
      border: 1px solid rgba(0, 245, 212, 0.4);
      color: var(--teal);
      background: rgba(0, 245, 212, 0.06);
    }

    .btn-ghost:hover {
      transform: scale(1.04);
      background: rgba(0, 245, 212, 0.12);
    }

    .is-hidden {
      display: none !important;
    }
`
