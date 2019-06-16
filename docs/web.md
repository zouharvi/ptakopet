The web frontend is written in TypeScript because of great scalability properties, DOM manipulation is done mostly with jQuery and the output is packed into one JavaScript file with Webpack. Packages are managed with npm. To build the web frontend, execute the following lines of code:

```
git clone https://github.com/zouharvi/ptakopet-web
cd ptakopet-web
git submodule update --init
npm install
npm run build
```

The file `dist/ptakopet-web.js` should now contain live code. You can run

```
npm run watch
```

to rebuild the code each time one of the source files changes.
