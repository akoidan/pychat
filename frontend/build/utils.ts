import { exec } from 'child_process';
import  {promisify} from 'util';
import {readFile} from "fs";

function makeid(length) {
  let result           = '';
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function getGitRevision() {
  try {
    const { stdout, stderr } = await promisify(exec)('git rev-parse --short=10 HEAD', {encoding: 'utf8'});
    return stdout.trim();
  } catch (e) {
    console.error(e)
    let result = `_${makeid(9)}`;
    console.log(`Git hash is unavailable, mocking with randoms string ${result}`);
    return result
  }
}

export async function readFileAsync(name: string) {
    return promisify(readFile)(name);
}

export function getConsts(gitHash: string, command: 'build' | 'serve') {
  const buildName = command === 'build' ?  './production.json' : './development.json';
  const result = require (buildName);
  result.GIT_HASH = gitHash;
  result.IS_SSL = true;
  // Do not use sw for dev server, it breaks hmr
  result.SERVICE_WORKER_URL = command === 'build' ? '/sw.js': null;
  result.IS_ANDROID = false;
  return result;
}
