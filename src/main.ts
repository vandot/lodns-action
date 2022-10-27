import * as path from 'path';
import * as cp from 'child_process';
import * as context from './context';
import * as installer from './installer';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    const inputs: context.Inputs = await context.getInputs();
    const lodns = await installer.install(inputs.version);
    core.startGroup(`Installing lodns ${inputs.version}...`);

    if (inputs.installOnly) {
      const lodnsDir = path.dirname(lodns);
      core.addPath(lodnsDir);
      core.info(`lodns ${inputs.version} installed successfully`);
      core.debug(`Added ${lodnsDir} to PATH`);
      core.endGroup();
      return;
    }

    await exec.exec(`sudo ${lodns} install`);

    if (context.osPlat == 'linux') {
     const s = await installer.ipSet();
     if (!s) {
      throw new Error(`IP not set`);
     }
    }
    core.info(`lodns ${inputs.version} installed successfully`);
    core.endGroup();

    core.startGroup(`Starting lodns...`);
    var child: cp.ChildProcess
    if (installer.useSudo()) {
      child = cp.spawn('sudo', [lodns, 'start'], { detached: true, windowsHide: true, shell: true, stdio: 'ignore' });
    } else {
      child = cp.spawn(lodns, ['start'], { detached: true, windowsHide: true, shell: true, stdio: 'ignore' });
    }
    child.unref();
    core.info(`lodns started`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
