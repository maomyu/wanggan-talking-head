import path from 'node:path';import {fileURLToPath} from 'node:url';import{build}from'./build-core.mjs';
const i=process.argv.indexOf('--project'),R=i>=0?path.resolve(process.argv[i+1]):path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');build(R);
