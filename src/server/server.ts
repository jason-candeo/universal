// polyfills
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import 'rxjs/Rx';
import * as fs from 'fs';
import * as path from 'path';

// angular
import { enableProdMode } from '@angular/core';

// libs
import * as express from 'express';
import * as compression from 'compression';
import { ngExpressEngine } from '@ngx-universal/express-engine';

// module
import { AppServerModule } from './app/app.server.module';

enableProdMode();
const server = express();
server.use(compression());

// copy over google site verification

/**
 * Look ma, it's cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src: string, dest: string) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    // fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName: any) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};

var temp_exists = fs.existsSync('./.temp');
var temp_stats = temp_exists && fs.statSync('./.temp');
var temp_isDirectory = temp_exists && temp_stats.isDirectory();

if(!temp_exists || !temp_isDirectory) {
  console.log('\n[server] No temp dir detected, creating...');
  fs.mkdirSync('./.temp');
  console.log('[server] Done creating .temp folder!\n');
}

console.log('\n[server] Copying all google verification files to public...');
copyRecursiveSync("./google-verification", "./public");
console.log('[server] Done with copy!\n');

/**
 * Set view engine
 */
server.engine('html', ngExpressEngine({
  bootstrap: AppServerModule
}));

server.set('view engine', 'html');
server.set('views', 'public');

/**
 * Point static path to `public`
 */
server.use('/', express.static('public', {index: false}));

// /**
//  * Catch all routes and return the `index.html`
//  */
server.get('*', (req, res) => {
  res.render('../public/index.html', {
    req,
    res
  });
});

/**
 * Port & host settings
 */
const port = 8080;
const PORT = process.env.PORT || port;
const HOST = process.env.BASE_URL || 'localhost';
const baseUrl = `http://${HOST}:${PORT}`;

server.set('port', PORT);

/**
 * Begin listening
 */
server.listen(server.get('port'), () => {
  // tslint:disable-next-line
  console.log(`Express server listening on ${baseUrl}`);
});
