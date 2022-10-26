import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as github from './github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

const osPlat: string = os.platform();
const osArch: string = os.arch();

export async function getLodns(version: string): Promise<string> {
  core.startGroup(`Checking lodns ${version} release...`);
  const release: github.GitHubRelease | null = await github.getRelease(version);
  if (!release) {
    throw new Error(`Cannot find lodns ${version} release`);
  }
  const semver: string = release.tag_name.replace(/^v/, '');
  core.info(`lodns ${semver} found`);
  core.endGroup();

  const filename = util.format('%s%s', getName(semver), osPlat == 'win32' ? '.exe' : '');
  const downloadUrl = util.format('https://github.com/vandot/lodns/releases/download/%s/%s', semver, filename);

  core.startGroup(`Downloading ${downloadUrl}...`);

  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.info(`Downloaded to ${downloadPath}`);

  const cachePath: string = await tc.cacheDir(downloadPath, 'lodns-action', semver);
  core.debug(`Cached to ${cachePath}`);

  const exePath: string = path.join(cachePath, getName(semver), osPlat == 'win32' ? '.exe' : '');
  core.debug(`Exe path is ${exePath}`);
  core.endGroup();

  return exePath;
}

function getName(version: string): string {
  let platform = '';
  if (osPlat == 'win32') {
    platform = osArch == 'x64' ? 'win64' : 'win32';
  } else if (osPlat == 'linux') {
    platform = osArch == 'x64' ? 'amd64_linux' : 'i386_linux';
  } else if (osPlat == 'darwin') {
    platform = osArch == 'x64' ? 'amd64_linux' : 'i386_linux';
  }
  return util.format('lodns-%s-%s', version, platform);
}
