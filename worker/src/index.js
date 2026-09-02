// Minimal placeholder Worker (infra stub). Real API logic comes in STEP 4.
export default {
  async fetch(request, env, ctx) {
    return new Response("aics-api OK", { status: 200 });
  }
};
