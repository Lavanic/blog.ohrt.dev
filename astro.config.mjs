// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import rehypeSidenotes from "./src/plugins/rehype-sidenotes.mjs";

export default defineConfig({
  site: "https://blog.ohrt.dev",
  outDir: "dist",
  // the sidenotes plugin is a rehype plugin, so stay on the unified processor
  markdown: {
    processor: unified({ rehypePlugins: [rehypeSidenotes] }),
  },
});
