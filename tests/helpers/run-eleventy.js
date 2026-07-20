const path = require("node:path");
const { Eleventy } = require("@11ty/eleventy");

async function main() {
  const fixtureRoot = path.resolve(process.argv[2]);
  process.chdir(fixtureRoot);

  const eleventy = new Eleventy("src", "_site", {
    configPath: ".eleventy.js",
  });
  await eleventy.write();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
