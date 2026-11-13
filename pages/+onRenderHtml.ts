// https://vike.dev/onRenderHtml
export { onRenderHtml };

import { renderToString } from "@vue/server-renderer";
import { dangerouslySkipEscape } from "vike/server";
import { transformHtmlTemplate } from "@unhead/vue/server";
import type { InjectFilterEntry, PageContextServer } from "vike/types";

import { createApp } from "@/app";
import shellHtml from "../index.html?raw";

async function onRenderHtml(pageContext: PageContextServer) {
  const { app, router, head } = await createApp();

  // Parameterized routes (e.g. /project/:projectId) stay client-rendered:
  // their view components pull in browser-only code (Leaflet), so they are
  // never rendered on the server — matching the Netlify SPA fallback, which
  // serves the prerendered shell for these URLs and lets the client render.
  const isParameterizedRoute = Object.keys(pageContext.routeParams ?? {}).length > 0;

  let appHtml = "";
  if (!isParameterizedRoute) {
    // Point vue-router at the URL being rendered (memory history on the server)
    router.push(pageContext.urlPathname);
    await router.isReady();
    appHtml = await renderToString(app);
  }

  // index.html is the HTML shell template (Vike does not use it as a build
  // entry). Inject the rendered app HTML; unhead then merges its tags into the
  // shell's <head> (extracting the existing tags first, so e.g. <title>,
  // canonical and og:url are replaced instead of duplicated). Vike itself
  // injects the client entry script and CSS assets into the returned
  // documentHtml. Replacer functions keep `$`-patterns in the injected HTML
  // literal.
  const documentHtml = await transformHtmlTemplate(
    head,
    shellHtml.replace('<div id="app"></div>', () => `<div id="app">${appHtml}</div>`),
  );

  // Inject the package version as a window global (client-side access via
  // window.__APP_VERSION__, see useAppVersion). Done after the unhead
  // transform so the inline script is left untouched.
  const finalHtml = documentHtml.replace(
    "<head>",
    () => `<head>\n    <script>window.__APP_VERSION__ = ${JSON.stringify(__APP_VERSION__)};</script>`,
  );

  return {
    documentHtml: dangerouslySkipEscape(finalHtml),
    // Vike preloads every JS chunk of the page (including lazily imported
    // ones such as the Leaflet map). Keep the vite-ssg behavior instead and
    // only load entry scripts upfront; lazy chunks load on demand.
    injectFilter: (assets: InjectFilterEntry[]) => {
      assets.forEach((asset) => {
        if (asset.isEntry || asset.assetType !== "script") return;
        asset.inject = false;
      });
    },
  };
}
