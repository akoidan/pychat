import { exec } from 'child_process';
import  {promisify} from 'util';
import {readFile} from "fs";

export async function getGitRevision() {
 const { stdout, stderr } = await promisify(exec)('git rev-parse --short=10 HEAD', {encoding: 'utf8'});
 return stdout.trim();
}

export async function readFileAsync(name: string) {
    return promisify(readFile)(name);
}