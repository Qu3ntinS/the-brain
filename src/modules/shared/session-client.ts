import { env } from '../../config/env'
import { expiresInSeconds } from '../../lib/auth-cookie'

const refreshMs = Math.max(
	60_000,
	Math.floor((expiresInSeconds(env.jwtExpiresIn) * 1000) / 2),
)

export const sessionClientScript = `
(function () {
  const REFRESH_MS = ${refreshMs};

  function setAuthed(isAuthed) {
    document.body.classList.toggle("is-authed", isAuthed);
    document.getElementById("nav-docs")?.classList.toggle("is-hidden", !isAuthed);
    document.getElementById("nav-login")?.classList.toggle("is-hidden", isAuthed);
  }

  async function refreshSession() {
    const response = await fetch("/refresh", {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  }

  async function checkSession() {
    try {
      const response = await fetch("/auth/me", { credentials: "include" });
      const isAuthed = response.ok;
      setAuthed(isAuthed);
      return isAuthed;
    } catch {
      setAuthed(false);
      return false;
    }
  }

  async function syncSession() {
    if (await checkSession()) {
      await refreshSession();
    }
  }

  syncSession();
  setInterval(syncSession, REFRESH_MS);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      syncSession();
    }
  });
})();
`
