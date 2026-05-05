(function () {
  function normalizeToken(raw) {
    if (!raw || typeof raw !== "string") return "";
    return raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : raw.trim();
  }

  function applyToken(token) {
    const normalized = normalizeToken(token);
    if (!normalized) return false;
    if (!window.ui || typeof window.ui.preauthorizeApiKey !== "function") return false;
    window.ui.preauthorizeApiKey("bearer-jwt", normalized);
    return true;
  }

  function tokenFromResponse(response, body) {
    if (body && typeof body.id_token === "string") return body.id_token;
    const authHeader = response.headers.get("Authorization");
    if (authHeader) return authHeader;
    return "";
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    try {
      const request = args[0];
      const url = typeof request === "string" ? request : request && request.url;
      if (url && /\/api\/authenticate(?:\?|$)/.test(url) && response.ok) {
        const body = await response.clone().json().catch(() => ({}));
        const token = tokenFromResponse(response, body);

        if (!applyToken(token)) {
          let tries = 0;
          const interval = setInterval(function () {
            tries += 1;
            if (applyToken(token) || tries > 30) clearInterval(interval);
          }, 250);
        }
      }
    } catch (_e) {
      // Non-blocking enhancement only; ignore parsing/interop errors.
    }
    return response;
  };
})();
