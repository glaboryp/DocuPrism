# Contributing to DocuPrism

First off, thank you for considering contributing to DocuPrism! It's people like you that make DocuPrism such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by respect and professionalism. By participating, you are expected to uphold this standard.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your Chrome version and OS**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Provide specific examples to demonstrate the enhancement**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Follow the TypeScript/Vue style guide
* Include screenshots in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Process

### Setup Development Environment

1. Fork the repo and clone your fork
2. Install dependencies: `pnpm install`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test your changes: `pnpm run dev`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to your fork: `git push origin feature/my-feature`
8. Submit a pull request

### Coding Standards

#### TypeScript
* Use TypeScript for all new code
* Define proper types, avoid `any`
* Use interfaces for object shapes
* Export types when they might be reused

#### Vue Components
* Use `<script setup lang="ts">` syntax
* Define props and emits with TypeScript
* Use composables for reusable logic
* Keep components focused and single-purpose

#### Naming Conventions
* Components: PascalCase (e.g., `FileUploader.vue`)
* Composables: camelCase with 'use' prefix (e.g., `useToast.ts`)
* Utilities: camelCase (e.g., `errorHandler.ts`)
* Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

#### Code Style
* Use 2 spaces for indentation
* Use single quotes for strings
* Add trailing commas in multi-line objects/arrays
* Use meaningful variable names
* Add comments for complex logic
* Keep functions small and focused

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Examples:
```
Add file upload validation
Fix toast notification timing
Update README with new features
```

### Testing

* Test your changes in Chrome Canary/Dev
* Test offline functionality
* Test on different screen sizes
* Test dark mode
* Test with different file types
* Test error scenarios

### Documentation

* Update README.md if needed
* Update CHANGELOG.md for notable changes
* Add JSDoc comments for complex functions
* Update TypeScript types if APIs change

## Project Structure

```
DocuPrism/
├── components/     # Reusable Vue components
├── composables/    # Vue composables (reusable logic)
├── config/         # Configuration files
├── layouts/        # Nuxt layouts
├── pages/          # Nuxt pages (routes)
├── sections/       # Page sections (larger components)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Key Technologies

* **Nuxt 3**: Meta-framework for Vue
* **Vue 3**: Frontend framework
* **TypeScript**: Type safety
* **Tailwind CSS**: Styling
* **Chrome Built-in AI**: On-device AI APIs

## What to Work On

Check out our [GitHub Issues](https://github.com/glaboryp/DocuPrism/issues) for:

* **Good First Issues**: Great for newcomers
* **Help Wanted**: Issues where we need help
* **Enhancement**: New feature ideas
* **Bug**: Reported bugs

## Questions?

Feel free to:
* Review the README.md
* Open an issue with your question
* Check existing issues and discussions

## Recognition

Contributors will be recognized in:
* README.md acknowledgments section
* Release notes for significant contributions

Thank you for contributing to DocuPrism! 🎉
