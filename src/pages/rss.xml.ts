import rss from "@astrojs/rss";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getCollection, render } from "astro:content";
import type { APIContext } from "astro";
import { postUrl } from "../lib/posts";

export async function GET(context: APIContext) {
  const { site } = context;
  if (!site) throw new Error("astro.config.mjs is missing `site`");

  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const container = await AstroContainer.create();
  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const html = await container.renderToString(Content);
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: postUrl(post),
        content: absoluteUrls(stripSidenotes(html), site),
      };
    })
  );

  return rss({
    title: "Oliver Ohrt’s Weblog",
    description: "Oliver Ohrt's blog.",
    site,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<atom:link href="${new URL("rss.xml", site)}" rel="self" type="application/rss+xml"/>`,
    items,
  });
}

function stripSidenotes(html: string) {
  const open = '<span class="sidenote">';
  let out = "";
  let i = 0;
  for (let start = html.indexOf(open); start !== -1; start = html.indexOf(open, i)) {
    out += html.slice(i, start);
    let depth = 0;
    const tags = /<span\b|<\/span>/g;
    tags.lastIndex = start;
    for (let m = tags.exec(html); m; m = tags.exec(html)) {
      depth += m[0] === "</span>" ? -1 : 1;
      if (depth === 0) {
        i = tags.lastIndex;
        break;
      }
    }
  }
  return out + html.slice(i);
}

function absoluteUrls(html: string, site: URL) {
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${site.origin}/`);
}
