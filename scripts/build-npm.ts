import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("npm");

await build({
  entryPoints: ["lib/index.ts"],
  outDir: "npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "html-composer",
    version: "1.0.0",
    description: "Import HTML files from other HTML files",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/willm30/html-composer.git",
    },
    bugs: {
      url: "https://github.com/willm30/html-composer/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    //Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});