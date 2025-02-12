import { Octokit } from '@octokit/rest';
import YAML from 'yaml';

const github = new Octokit();

type TemplateContent = Awaited<ReturnType<typeof Template.getContent>>;

export class Template {
  constructor(
    public name: string,
    public description: string,
    public path: string,
    public language: 'nodejs' | 'python',
    public kind: 'app' | 'lib',
  ) {}

  static async getContent(path: string) {
    const { data } = await github.rest.repos.getContent({
      owner: 'DynamicQuants',
      repo: 'devkit',
      ref: 'main',
      path,
    });

    if (!Array.isArray(data)) return [];

    return data;
  }

  private isValidTemplate(content: TemplateContent) {
    const moonYmlContent = content.find((item) => item.name === 'moon.yml');
    const devkitJsonContent = content.find((item) => item.name === 'devkit.json');
    const templateYmlContent = content.find((item) => item.name === 'template.yml');
    return moonYmlContent && devkitJsonContent && templateYmlContent;
  }

  public async getTemplates() {
    const data = await Template.getContent('packages');

    // Filtering only valid directories of templates.
    const templates = data
      .filter((item) => item.type === 'dir')
      .reduce<Promise<Template[]>>(
        async (acc, item) => {
          const content = await Template.getContent(item.path);
          const moonYmlContent = content.find((item) => item.name === 'moon.yml');
          // const devkitJsonContent = content.find((item) => item.name === 'devkit.yml');
          // const templateYmlContent = content.find((item) => item.name === 'template.yml');

          // if (!!moonYmlContent) return acc;

          // Download moon.yml using fetch
          const moonYml = await fetch(moonYmlContent.download_url);
          const textData = await moonYml.text();

          // Process yml file.
          const yml = YAML.parse(textData);

          // const { title, description, destination, variables } = await moonYml.blob();

          // const template = new Template(item.name, title, description, destination, variables);

          console.log(item.path, yml);
          return [...(await acc)];
        },
        [] as unknown as Promise<Template[]>,
      );
  }
}
