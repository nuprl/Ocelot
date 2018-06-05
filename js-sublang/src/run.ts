import * as fs from 'fs';
import { compile } from './index';

try {
  console.log(compile(fs.readFileSync(process.argv[2], { encoding: 'utf8' })));
}
catch (exn) {
  console.log(exn.codeFrame);
  console.log(exn.message);
}