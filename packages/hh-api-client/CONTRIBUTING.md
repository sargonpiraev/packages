# Contributing to HeadHunter API Client

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

**Prerequisites**

- Node.js >= v18.0.0
- npm >= 8.0.0
- Access to HeadHunter API for testing

**Setup**

```bash
# Clone repository
git clone https://github.com/sargonpiraev/hh-api-client.git
cd hh-api-client

# Install dependencies
npm install

# Start development mode
npm run dev
```

**Build and Test**

```bash
# Generate client from OpenAPI spec
npm run openapi-ts

# Build the project
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## Development Guidelines

**Code Style**

- Use TypeScript for all code
- Follow existing code patterns and conventions
- Add JSDoc comments for public APIs
- Use descriptive variable and function names
- Maintain tree-shakeable exports

**Client Development**

- Each API endpoint should have proper TypeScript types
- Include comprehensive input validation
- Provide clear error messages
- Add examples to README for new functionality

**OpenAPI Integration**

- Never manually edit generated code
- Update OpenAPI spec URL if API changes
- Test type generation after spec updates
- Ensure all endpoints are covered

**Testing**

- Write tests for new client functions
- Test error handling scenarios
- Ensure type safety in tests
- Mock API responses for reliable testing

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Implement** your changes following the development guidelines
3. **Test** your changes thoroughly including type checking
4. **Update** documentation if needed
5. **Submit** a pull request with a clear description

**Pull Request Requirements**

- Clear, descriptive title
- Description of changes and motivation
- Tests pass and code is linted
- TypeScript compilation succeeds
- Documentation updated if applicable
- No breaking changes without discussion

## Reporting Issues

When reporting bugs or requesting features:

1. **Search** existing issues first
2. **Use** the appropriate issue template
3. **Provide** detailed information:
   - Node.js version
   - Package version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant API responses or error messages

## Community Guidelines

- Be respectful and constructive
- Help others learn and grow
- Focus on the technical aspects
- Follow GitHub's community guidelines

## Development

```bash
# Install dependencies
npm install

# Generate types from OpenAPI spec
npm run openapi-ts

# Build the project
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## Questions?

- 📧 Email: [sargonpiraev@gmail.com](mailto:sargonpiraev@gmail.com)
- 🐛 Report issues on [GitHub](https://github.com/sargonpiraev/hh-api-client/issues)

Thank you for contributing! 🎉
