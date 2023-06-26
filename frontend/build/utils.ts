import { exec } from 'child_process';
import  {promisify} from 'util';
import {readFile} from "fs";
import smileysData from '../src/assets/smileys.json';

function makeid(length) {
  let result           = '';
  const characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getSmileyUrls() {
  const assets = [];
  Object.values(smileysData).forEach(tab => {
    Object.values(tab).forEach((v: any) => {
      assets.push(`smileys/${v.src}`);
      if (v.skinVariations) {
        assets.push(...Object.values(v.skinVariations).map((v: any) => `/smileys/${v.src}`))
      }
    })
  })
  // check ts/utils/smileys.ts@init
  assets.push("/smileys/smileys.json")
  return assets;
}

export async function getGitRevision() {
  if (process.env.PYCHAT_GIT_HASH) {
    console.log(`Getthing git hash from ENV $PYCHAT_GIT_HASH ${process.env.PYCHAT_GIT_HASH}`)
    return process.env.PYCHAT_GIT_HASH;
  }

  try {
    const { stdout, stderr } = await promisify(exec)('git rev-parse --short=10 HEAD', {encoding: 'utf8'});
    let result = stdout.trim();
    console.log(`Got git hash from git ${result}`);
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
  // Do not use sw for dev server, it breaks hmr
  result.SERVICE_WORKER_URL = command === 'build' ? '/sw.js': null;
  result.IS_ANDROID = false;
  return result;
}
