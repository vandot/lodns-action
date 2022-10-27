import * as path from 'path';
import * as util from 'util';
import * as context from './context';
import * as github from './github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import {execSync} from 'child_process';

export async function install(version: string): Promise<string> {
  core.startGroup(`Checking lodns ${version} release...`);
  const release: github.GitHubRelease | null = await github.getRelease(version);
  if (!release) {
    throw new Error(`Cannot find lodns ${version} release`);
  }
  const semver: string = release.tag_name.replace(/^v/, '');
  core.info(`lodns ${semver} found`);
  core.endGroup();

  const filename = util.format('%s.%s', getFilename(), context.osPlat == 'win32' ? 'zip' : 'tar.gz');
  const downloadUrl = util.format('https://github.com/vandot/lodns/releases/download/%s/%s', semver, filename);

  core.startGroup(`Downloading ${downloadUrl}...`);

  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.info(`Downloaded to ${downloadPath}`);

  core.info('Extracting lodns');
  let extPath: string;
  if (context.osPlat == 'win32') {
    extPath = await tc.extractZip(downloadPath);
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug(`Extracted to ${extPath}`);

  const cachePath: string = await tc.cacheDir(extPath, 'lodns-action', semver);
  core.debug(`Cached to ${cachePath}`);
  const exePath: string = path.join(cachePath, getFilename(), context.osPlat == 'win32' ? '.exe' : '');
  core.debug(`Exe path is ${exePath}`);
  core.endGroup();

  return exePath;
}

const getFilename = (): string => {
  let arch: string;
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
  return util.format('lodns-%s-%s', platform, arch);
};

const version = execSync('systemd --version | head -1 | awk \'{print $2}\'');

export const useSudo = (): boolean => {
  let sudo: boolean = false;
  if (context.osPlat == 'linux') {
    if (Number(version) <= 245) {
      sudo = true;
    }
  } else if (context.osPlat == 'win32') {
    sudo = true;
  }
  return sudo;
}
