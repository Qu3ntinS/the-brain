import { brainBaseStyles } from '../shared/brain-styles'

export const loginPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in — The Brain</title>
  <link rel="icon" href="/assets/brain-logo.png" type="image/png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet" />
  <style>
${brainBaseStyles}

    .wrap {
      position: relative;
      z-index: 2;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
    }

    .login-card {
      width: min(100%, 400px);
      padding: 2rem;
      border-radius: 1.25rem;
      border: 1px solid rgba(255, 107, 203, 0.25);
      background: rgba(26, 10, 62, 0.92);
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
    }

    .login-card h1 {
      font-family: "Syne", sans-serif;
      font-size: 2rem;
      margin-bottom: 0.35rem;
    }

    .login-hint {
      color: var(--muted);
      font-size: 0.92rem;
      margin-bottom: 1.5rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .login-form label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      text-align: left;
      font-size: 0.85rem;
      color: var(--muted);
    }

    .login-form input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(184, 169, 217, 0.25);
      background: rgba(13, 2, 33, 0.8);
      color: var(--text);
      font: inherit;
    }

    .login-form input:focus {
      outline: 2px solid rgba(0, 245, 212, 0.35);
      border-color: rgba(0, 245, 212, 0.45);
    }

    .login-error {
      color: #ff8fab;
      font-size: 0.88rem;
      min-height: 1.2em;
    }

    .login-form .btn {
      justify-content: center;
      margin-top: 0.25rem;
      border: 0;
      cursor: pointer;
    }

    .back-link {
      display: inline-block;
      margin-top: 1.25rem;
      color: var(--muted);
      font-size: 0.9rem;
      text-decoration: none;
    }

    .back-link:hover {
      color: var(--teal);
    }
  </style>
</head>
<body>
  <div class="bg"></div>

  <div class="wrap">
    <div class="login-card">
      <h1>Sign in</h1>
      <p class="login-hint">Private access to The Brain.</p>
      <form class="login-form" id="login-form">
        <label>
          Username
          <input name="username" autocomplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <p class="login-error" id="login-error" aria-live="polite"></p>
        <button type="submit" class="btn btn-primary">Log in</button>
      </form>
      <a class="back-link" href="/">← Back to The Brain</a>
    </div>
  </div>

  <script>
    (function () {
      const form = document.getElementById("login-form");
      const errorEl = document.getElementById("login-error");
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/";

      async function redirectIfAuthed() {
        const response = await fetch("/auth/me", { credentials: "include" });
        if (response.ok) {
          window.location.replace(next);
        }
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorEl.textContent = "";

        const data = new FormData(form);
        const payload = {
          username: String(data.get("username") ?? ""),
          password: String(data.get("password") ?? ""),
        };

        try {
          const response = await fetch("/auth/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            errorEl.textContent = "Invalid username or password.";
            return;
          }

          await fetch("/refresh", {
            method: "POST",
            credentials: "include",
          });

          window.location.replace(next);
        } catch {
          errorEl.textContent = "Could not reach The Brain. Try again.";
        }
      });

      redirectIfAuthed();
    })();
  </script>
</body>
</html>`
