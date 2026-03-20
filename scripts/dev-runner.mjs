#!/usr/bin/env node

import { spawn } from "node:child_process";
import process from "node:process";
import readline from "node:readline";

const bunCommand = process.platform === "win32" ? "bun.exe" : "bun";

const MODES = {
  dev: [
    {
      name: "convex",
      cwd: process.cwd(),
      args: ["run", "dev:convex"],
    },
    {
      name: "web",
      cwd: process.cwd(),
      args: ["run", "--cwd", "apps/web", "dev"],
    },
  ],
  "dev:all": [
    {
      name: "convex",
      cwd: process.cwd(),
      args: ["run", "dev:convex"],
    },
    {
      name: "web",
      cwd: process.cwd(),
      args: ["run", "--cwd", "apps/web", "dev"],
    },
    {
      name: "marketing",
      cwd: process.cwd(),
      args: ["run", "--cwd", "apps/marketing", "dev"],
    },
    {
      name: "desktop",
      cwd: process.cwd(),
      args: ["run", "--cwd", "apps/desktop", "dev"],
    },
  ],
};

const mode = process.argv[2] ?? "dev";
const specs = MODES[mode];

if (!specs) {
  console.error(`Unknown dev mode: ${mode}`);
  process.exit(1);
}

const children = [];
let shuttingDown = false;

function prefixStream(name, stream) {
  const lineReader = readline.createInterface({ input: stream });
  lineReader.on("line", (line) => {
    console.log(`[${name}] ${line}`);
  });
}

function stopChildren(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 1_000).unref();
}

for (const spec of specs) {
  const child = spawn(bunCommand, spec.args, {
    cwd: spec.cwd,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.push(child);

  if (child.stdout) {
    prefixStream(spec.name, child.stdout);
  }

  if (child.stderr) {
    prefixStream(spec.name, child.stderr);
  }

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      console.error(`[${spec.name}] exited from signal ${signal}`);
      stopChildren(1);
      return;
    }

    if (code !== 0) {
      console.error(`[${spec.name}] exited with code ${String(code)}`);
      stopChildren(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stopChildren(0));
process.on("SIGTERM", () => stopChildren(0));
