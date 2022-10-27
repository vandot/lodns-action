import * as path from 'path';
import {spawn} from 'child_process';
import * as context from './context';
import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs();
    const lodns = await installer.install(inputs.version);
    core.info(`lodns ${inputs.version} installed successfully`);

    if (inputs.installOnly) {
      const lodnsDir = path.dirname(lodns);
      core.addPath(lodnsDir);
      core.debug(`Added ${lodnsDir} to PATH`);
      return;
    }

    await exec.exec(`sudo ${lodns} install`);

    if (context.osPlat == 'linux') {
     const s = await installer.ipSet();
     if (!s) {
      throw new Error(`IP not set`);
     }
     console.log("HERE")
    }

    // var child: cp.ChildProcess
    if (installer.useSudo()) {
      core.info(`Starting with sudo!`);
      const sudoChild = spawn('sudo', [lodns, 'start'], {
      detached: true,
      windowsHide: true,
      shell: true,
      stdio: 'ignore'
      });
      sudoChild.unref();
      } else {
      core.info(`Starting!`);
      const child = spawn(lodns, ['start'], {
      detached: true,
      windowsHide: true,
      shell: true,
      stdio: 'ignore'
      });
      child.unref();
    }
    // child.unref();

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
