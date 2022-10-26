import * as path from 'path';
import * as util from 'util';
import * as context from './context';
import * as github from './github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

export async function install(version: string): Promise<string> {
  core.startGroup(`Checking lodns ${version} release...`);
  const release: github.GitHubRelease | null = await github.getRelease(version);
  if (!release) {
    throw new Error(`Cannot find lodns ${version} release`);
  }
  const semver: string = release.tag_name.replace(/^v/, '');
  core.info(`lodns ${semver} found`);
  core.endGroup();

  const filename = util.format('%s', getFilename());
  const downloadUrl = util.format('https://github.com/vandot/lodns/releases/download/%s/%s', semver, filename);

  core.startGroup(`Downloading ${downloadUrl}...`);

  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.info(`Downloaded to ${downloadPath}`);

  const cachePath: string = await tc.cacheDir(downloadPath, 'lodns-action', semver);
  core.debug(`Cached to ${cachePath}`);

  const exePath: string = path.join(cachePath, getFilename());
  core.debug(`Exe path is ${exePath}`);
  core.endGroup();

  return exePath;
}

const getFilename = (): string => {
  let arch: string;
  let ext: string = '';
  let platform: string = context.osPlat;
  switch (context.osArch) {
    case 'x64': {
      arch = 'amd64';
      break;
    }
    case 'x32': {
      throw new Error(`Unsupported Arch`);
    }
    case 'arm': {
      throw new Error(`Unsupported Arch`);
    }
    default: {
      arch = context.osArch;
      break;
    }
  }
  if (context.osPlat == 'win32') {
    platform = 'windows';
  }
  return util.format('lodns_%s_%s%s', platform, arch, ext);
};
