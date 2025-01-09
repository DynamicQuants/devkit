<p align="center">
  <a href="https://dq.tools">
    <picture >
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/DynamicQuants/devkit/main/assets/images/dq-logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/DynamicQuants/devkit/main/assets/images/dq-logo-light.svg">
      <img width="120" height="120" alt="Dynamic Quants logo" src="https://raw.githubusercontent.com/DynamicQuants/devkit/main/assets/images/dq-logo-light.svg">
    </picture>
  </a>
</p>

<h1 align="center">
  Devkit Configs Package
</h1>

<p align="center">
This package contains the configurations for Typescript/JavaScript development tools used by the Dynamic Quants Team.
</p>

## 💡 Motivation

The goal of this package is to provide a set of configurations that can be used in any project. This saves us from having to copy and paste the same configurations across projects and allows us to manage them in one place 😎.

## 🚀 Features

This package contains the following configurations focused on applications and libraries on top of NextJS, React, NestJS, and Node.js technologies:

- ESLint: A linting tool for JavaScript.
- Jest: A testing framework for JavaScript.
- TypeScript: A programming language for JavaScript.
- Playwright: A framework for browser automation and testing.
- Prettier: A code formatter for JavaScript.
- Tailwind: A utility-first CSS framework for rapidly building custom designs.
- Vite: A build tool for modern web development.

## 🔌 Installation

To use the configurations in your project, you can install the package using pnpm:

```bash
pnpm install @dynamic-quants/configs@latest
```

## 📚 Usage

The usage is very simple and straightforward. You just need to extend the configurations in your project.

1. After installing the package, add the `install` script to your `package.json` file. This script will install the required dependencies for the project. Also checks for the latest version of the package and upgrades it if necessary.

```json
"scripts": {
  "install": "npx @dynamic-quants/configs@latest setup"
}
```

2. Add the necessary configurations to your project. For example, if you are using NextJS library, you can add the following to your `package.json` file:

```json
{
  "devkit": {
    "template": "nextjs-lib"
  }
}
```
