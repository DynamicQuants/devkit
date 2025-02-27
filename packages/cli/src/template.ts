import { readFileSync } from 'fs';
import { join } from 'path';
import tiged from 'tiged';

import { runCommand, setFileData } from './helpers';
import logger from './logger';
import promps from './promps';
import { Language, type TemplateInfo } from './types';
import { type Workspace } from './workspace';

interface TemplateProps {
  name: string;
  description: string;
  template: TemplateInfo;
  workspace: Workspace;
}

const NODE_INSTALL_DEPS = 'pnpm install';
const UV_PYTHON_DEPS = 'uv pip install -r requirements.txt';

/**
 * A template is a set of files that are used to create a new project. It includes a devkit.json
 * file that contains the devDependencies that are needed to run the project and other attributes
 * that are used to configure the project.
 */
class Template {
  private destination: string;
  constructor(public props: TemplateProps) {}

  private async setDestination() {
    const { workspace, name } = this.props;
    const dirs = workspace.getTemplateDirs();
    const workspaceDir = await promps.templateDestinationPrompt(dirs);
    this.destination = join(workspace.config.rootPath, workspaceDir, name);
  }

  get packageJSONLocation() {
    return join(this.destination, 'package.json');
  }

  get devkitConfigLocation() {
    return join(this.destination, 'devkit.json');
  }

  public async setup() {
    // Download the template.
    await this.setDestination();

    // Change the directory to the template destination.
    await logger.info('Donwloading template');
    const emitter = tiged(`DynamicQuants/devkit/${this.props.template.path}`, {});
    await emitter.clone(this.destination);

    // Change the directory to the template destination.
    process.chdir(this.destination);

    // Replace the name in the package.json file and add devDependencies if it is a nodejs template.
    if (this.props.template.language === Language.NODEJS) {
      const packageJSON = JSON.parse(readFileSync(this.packageJSONLocation, 'utf8'));
      const devkitConfig = JSON.parse(readFileSync(this.devkitConfigLocation, 'utf8'));
      packageJSON.name = this.props.name;
      packageJSON.description = this.props.description;
      packageJSON.peerDependencies = devkitConfig.peerDependencies;
      setFileData(this.packageJSONLocation, JSON.stringify(packageJSON, null, 2), 'overwrite');
      await runCommand({ command: NODE_INSTALL_DEPS, name: 'Installing Node.js dependencies' });
    }

    // Install the dependencies.
    if (this.props.template.language === Language.PYTHON) {
      await runCommand({ command: UV_PYTHON_DEPS, name: 'Installing Python dependencies' });
    }

    await logger.success('🎉 Template setup complete!');
  }
}

export type { TemplateInfo };
export { Template };
