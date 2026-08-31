import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Using a relative base ("./") means the build works when hosted at
// https://<username>.github.io/<repo-name>/ regardless of what the repo
// is named — no need to hardcode the repo name here. If you deploy to a
// custom domain or the root of a user/organization site instead, you can
// change this back to "/".
export default defineConfig({
  plugins: [react()],
  base: "./",
});
