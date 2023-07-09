# html-composer

html-composer has one objective. 

You should be able to import HTML documents into other HTML documents.

## Getting Started

Ensure Node.js is installed along with the NPM cli.

To install, run:
```
npm i @willm30/html-composer
```

To compose html files, run:

```
npx html-composer
```

## Command line arguments

html-composer takes two command line arguments.

`--src`: the path of the source file. This will default to `index.html` in the directory you run html-composer from if left empty.

`--dst`: the path of the composed html file. This will default to `build/${src-file-name}.html` if left empty. Ensure your output directory already exists before trying to write to it.

Example:

```
npx html-composer --src=lib/index.html --dst=output/index.html

```
## Syntax

html-composer introduces the non-standard `<import>` tag.


``` html

<body>
    <main>
        <import from "./components/heading.html" />
    </main>
</body>

```

Running html-composer will build your source file, recursively replacing each import file it finds with the source HTML.

It then uses `prettier` with the default configuration to prettify the output before writing it to a destination file you specify (the default is `build/${src-file-name}.html`).


## Errors

html-composer has three known error types:

1. Infinite cycle: it will throw if you try to import files that import one another endlessly
2. Invalid file extension: it will throw if you try to import a file that doesn't end in `.html`
3. File not found: it will throw if it cannot access the file you're trying to import, most likely because it doesn't exist at the specified path.

Happy composing!