import { execSync } from 'child_process';

const replaceCmdColorExp = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

const exec = async (command: string, cwd = '.') =>
  await execSync(command, { cwd: cwd })
    .toString()
    .replace(replaceCmdColorExp, '');

const log = (txt: string) => console.log(txt);

export const exec_log = async (command: string, cwd?: string) =>
  exec(command, cwd).then(log);

export const cp_dist = async (filename: string) => exec(`cp ${filename} dist/`);
