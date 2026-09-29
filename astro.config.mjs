// @ts-check
import { defineConfig } from "astro/config";
import rehypeSidenotes from "./src/plugins/rehype-sidenotes.mjs";

export default defineConfig({
  site: "https://blog.ohrt.dev",
  outDir: "dist",
  markdown: {
    rehypePlugins: [rehypeSidenotes],
  },
});
