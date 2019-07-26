The code is hosted as [zouharvi/ptakopet](https://github.com/zouharvi/ptakopet)

## Build

The web frontend is written in TypeScript because of great scalability properties, DOM manipulation is done mostly with jQuery and the output is packed into one JavaScript file with Webpack. Packages are managed with npm (usually contained in the `nodejs` package). To build the web frontend, execute the following lines of code:

```
git clone https://github.com/zouharvi/ptakopet
cd ptakopet
git submodule update --init
npm install
npm run build
```

The file `web/ptakopet-web.js` should now contain live code. You can run

```
npm run watch
```

to rebuild the code each time one of the source files changes.

## Technical design

The following diagram describes the overall object structure of the project.

<img src='https://raw.githubusercontent.com/zouharvi/ptakopet/master/meta/web_object_design.svg?sanitize=true' style='width: 100%px;'>

The entry point is `main.ts`, but many classes are self-instantiated, as they follow the singleton pattern. Hence the file `messages/translator.ts`, which contains the class definition `TranslatorSource` also contains an object `translator_source`, which can be imported from other modules.