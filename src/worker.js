// Humanity, Live: serves the page and the shared world's start time.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/world") {
      return new Response(JSON.stringify({ start: Number(env.WORLD_START), name: "Humanity, Live" }), {
        headers: { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": "*" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
