import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

const salesforceStaticResourceDir = path.resolve(
  __dirname,
  "../../QuickFundForm"

);
/** Static resource index.html must use relative paths and a classic script (not type=module). */
function salesforceStaticResourceHtml(): Plugin {
  return {
    name: "salesforce-static-resource-html",
    closeBundle() {
      const indexPath = path.join(salesforceStaticResourceDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      let html = fs.readFileSync(indexPath, "utf8");
      html = html
        .replace(/\ssrc="\/assets\//g, ' src="./assets/')
        .replace(/\shref="\/assets\//g, ' href="./assets/')
        .replace(/\shref="\/favicon\.ico"/g, ' href="./favicon.ico"')
        .replace(/\s+crossorigin(="[^"]*")?/g, "")
        .replace(/\stype="module"/g, "");

      // Vite injects the script in <head>, but #root is in <body> — move script to body end.
      const scriptTag =
        html.match(/<script[^>]*src="\.\/assets\/index\.js"[^>]*><\/script>/)?.[0] ??
        html.match(/<script[^>]*src="\.\/assets\/index\.js"[^>]*\/>/)?.[0];
      if (scriptTag) {
        html = html.replace(scriptTag, "");
        html = html.replace("</body>", `  ${scriptTag.replace("<script", "<script defer")}\n  </body>`);
      }

      fs.writeFileSync(indexPath, html);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && salesforceStaticResourceHtml(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    target: "es2017",
    // IIFE bundle: works in static-resource iframe and (when LWS allows) loadScript.
    outDir: salesforceStaticResourceDir,
    emptyOutDir: true,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: "iife",
        name: "QuickFundFormApp",
        inlineDynamicImports: true,
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "assets/style.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },
}));
