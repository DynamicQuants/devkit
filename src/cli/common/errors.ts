class FatalError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class LanguageNotFoundError extends FatalError {
  constructor(language: string) {
    super(`Language ${language} not found in the languagesMapper.`);
  }
}

export class ToolNotFoundError extends FatalError {
  constructor(tool: string) {
    super(`Tool ${tool} not found in the toolsMapper.`);
  }
}

export class RequiredToolNotFoundError extends FatalError {
  constructor(tool: string, message: string) {
    super(`Required tool ${tool} not found. ${message}`);
  }
}

export class NotImplementedError extends FatalError {
  constructor(message: string) {
    super(`Not implemented: ${message}`);
  }
}

export class InvalidParameterError extends FatalError {
  constructor(name: string) {
    super(`Invalid parameter: ${name}`);
  }
}
