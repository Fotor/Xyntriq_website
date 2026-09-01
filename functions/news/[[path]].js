// Stork Wire news proxy: serves Stork's news feed at xyntriq.in/news
// Articles live on Stork's servers; this function proxies them under our domain.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const rest = url.pathname.replace(/^\/news/, "");
  return fetch("https://www.stork.ai/wire/weylatkd2uzk7tb7v" + rest + url.search, context.request);
}
