# Contributing to Monarch Legal Platform

Thank you for your interest in contributing to the Monarch Legal Platform! This document provides guidelines for contributing to our open core project.

## Open Core Model

This project follows an **AGPL-3 open core model**:
- ✅ **Open Source**: Core functionality, basic features, and community contributions
- 🔒 **Private**: Premium features, enterprise capabilities, and business model components

## Before You Start

### Code of Conduct
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### License Agreement
By contributing, you agree to license your contributions under AGPL-3.

### Security First
- Never commit secrets, API keys, or credentials
- Review the [Security Policy](SECURITY.md) before contributing
- Run security checks before submitting PRs

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- TypeScript knowledge
- React/Next.js experience (for frontend)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/Monarch-Tech-Dev/Monarch-Legal-Platform.git
cd Monarch-Legal-Platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

### Security Checks
Before making changes:
```bash
# Check for secrets
git secrets --scan

# Audit dependencies
npm audit

# Run security linter
npm run lint:security
```

## Contribution Guidelines

### What We Accept
✅ **Open Source Contributions**:
- Bug fixes in core functionality
- Performance improvements
- Documentation improvements
- Test coverage improvements
- Accessibility enhancements
- Internationalization (i18n)
- Core API improvements
- Basic UI/UX enhancements
- Community-requested features

### What We Don't Accept
❌ **Premium/Private Features**:
- Enterprise authentication systems
- Advanced analytics and reporting
- Premium AI models or algorithms
- Billing and subscription management
- Enterprise compliance features
- Advanced security features
- Custom branding options
- Priority support features
- Business intelligence components

### Contribution Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/Monarch-Tech-Dev/Monarch-Legal-Platform.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation
   - Run security checks

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   npm run security-check
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format
Use conventional commits:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `security`: Security improvements

Example:
```
feat(contradiction-detector): add Norwegian administrative law patterns

- Enhanced detection for forvaltningsloven § 17 violations
- Added jurisdiction contradiction patterns
- Improved confidence scoring for administrative cases

Closes #123
```

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types
- Use proper type annotations
- No `any` types without justification

#### React/Frontend
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.1)
- Use TypeScript for all components

#### Backend/API
- Follow RESTful API design
- Implement proper error handling
- Use middleware for common functionality
- Document all endpoints

#### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines

## Review Process

### Automated Checks
All PRs must pass:
- ✅ TypeScript compilation
- ✅ ESLint and Prettier
- ✅ Unit tests
- ✅ Integration tests
- ✅ Security scans
- ✅ License compatibility

### Manual Review
- Code quality and architecture
- Security implications
- Performance impact
- Documentation completeness
- Test coverage
- Accessibility compliance

## Community

### Communication
- 💬 **Discussions**: GitHub Discussions for questions and ideas
- 🐛 **Issues**: GitHub Issues for bug reports and feature requests
- 📧 **Email**: community@monarchlegal.com for general inquiries

### Recognition
Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community highlights
- Annual contributor awards

## Development Resources

### Documentation
- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Security Guidelines](SECURITY.md)
- [Deployment Guide](docs/deployment.md)

### Tools
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Questions?

If you have questions about contributing:
- Check existing [GitHub Discussions](https://github.com/Monarch-Tech-Dev/Monarch-Legal-Platform/discussions)
- Read our [FAQ](docs/faq.md)
- Email: community@monarchlegal.com

Thank you for helping make legal technology more accessible! 🚀