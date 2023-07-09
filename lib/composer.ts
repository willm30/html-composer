import { BufReader } from "https://deno.land/std@0.192.0/io/buf_reader.ts";
import { parse } from "https://deno.land/std@0.192.0/flags/mod.ts";

import * as prettier from "prettier";
import { ErrorReporter, ErrorTypes } from "./errorReporter.ts";

const CustomTags = {
  import: "<import",
  selfClosing: "/>",
};

export class Composer {
  reporter = new ErrorReporter();
  args = this.parseArgs();

  private parseArgs() {
    return parse(Deno.args, {
      string: ["src", "dst"],
      default: {src: "index.html"}
    });
  }

  public async compose(): Promise<void> {
    const entry = this.args.src;
    this.validatePath(entry, Deno.cwd());
    const fileName = entry.split("/").at(-1)!.split(".").at(0);
    const outputPath = this.args.dst || `build/${fileName}.html`;
    const htmlString = await this.generateHTML(entry, new Map());
    const formattedString = await prettier.format(htmlString, {
      parser: "html",
    });

    try {
      await Deno.writeTextFile(outputPath, formattedString, {
        create: true,
      });
    } catch {
      await Deno.mkdir("build");
      await Deno.writeTextFile(outputPath, formattedString, { create: true });
    }
  }

  private resolvePath(currentPath: string, toPath: string) {
    if (toPath[0] === ".") {
      const fragments = toPath.split("/");
      const currFragments = currentPath.split("/");
      // don't care about file name
      currFragments.pop();

      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        if (fragment === ".") {
          continue;
        } else if (fragment === "..") {
          currFragments.pop();
        } else {
          return currFragments.concat(fragments.slice(i)).join("/");
        }
      }

      currFragments.push("index.html");
      return currFragments.join("/");
    } else {
      return toPath;
    }
  }

  private async generateHTML(
    toPath: string,
    seen: Map<string, string>
  ): Promise<string> {
    let htmlFile!: Deno.FsFile;

    try {
     htmlFile = await Deno.open(toPath);
    } catch(e) {
        this.reporter.throwError(ErrorTypes.FileNotFound, {toPath, originalError: e})
    }

    const reader = new BufReader(htmlFile);
    let line = await reader.readString("\n");
    const lines = [];

    while (line) {
      const trimmed = line.trim();
      if (trimmed.startsWith(CustomTags.import)) {
        const length = CustomTags.import.length;
        const source = this.trimQuotes(
          trimmed
            .substring(length, trimmed.length - CustomTags.selfClosing.length)
            .trim()
            .split("=")
            .at(-1)!
        );

        const resolvedPath = this.resolvePath(toPath, source);
        const previouslyResolvedAt = seen.get(resolvedPath);
        if (previouslyResolvedAt) {
          this.reporter.throwError(ErrorTypes.InfiniteCycle, {
            resolvedPath,
            toPath,
            previouslyResolvedAt,
          });
        }
        seen.set(resolvedPath, toPath);
        this.validatePath(resolvedPath, toPath);
        lines.push(await this.generateHTML(resolvedPath, seen));
        seen.delete(resolvedPath);
      } else {
        lines.push(line);
      }

      line = await reader.readString("\n");
    }

    htmlFile.close();
    return lines.join("");
  }

  private validatePath(path: string, cwd: string): void {
    const extn = path.split(".").at(-1);
    if (extn !== "html") {
      this.reporter.throwError(ErrorTypes.InvalidExtn, { extn, cwd });
    }
  }

  private trimQuotes(string: string) {
    // If it doesn't begin with a single or double quote, assume it's not wrapped in either
    if (string[0] !== '"' && string[0] !== "'") {
      return string;
    }

    const res = string.substring(1, string.length - 1);
    return res;
  }
}
