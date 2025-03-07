import chalk from 'chalk';

// import type { Language } from '../common';
import { logger } from '../common';
import { LanguageNotFoundError } from '../common';
import type { Workspace } from '../workspace';
import { NodeLanguage } from './node';
import { PythonLanguage } from './python';

/**
 * List of supported languages.
 */
const supportedLanguages = {
  [NodeLanguage.languageName]: new NodeLanguage(),
  [PythonLanguage.languageName]: new PythonLanguage(),
};

type Language = keyof typeof supportedLanguages;

/**
 * Install the languages. If any of them is not supported, it will
 * throw `LanguageNotFoundError`.
 */
async function installLanguages(languages: Language[], workspace: Workspace) {
  logger.start('Installing languages');

  await Promise.all(
    languages.map(async (language) => {
      // Checking if the language exists in the languagesSetups.
      if (!supportedLanguages[language]) {
        throw new LanguageNotFoundError(language);
      }

      logger.setContext(language);
      await supportedLanguages[language].setup(workspace);
    }),
  );
  logger.success(`Languages installed: ${chalk.yellow(languages.join(', '))}`);
}

export { installLanguages, NodeLanguage, PythonLanguage, supportedLanguages };
export type { Language };
