# Contributing to Crypto Trading Bot

Thank you for your interest in contributing to the Crypto Trading Bot project! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/bot-crypto.git
   cd bot-crypto
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Use Prettier for code formatting

### Commits

- Use conventional commit messages
- Keep commits focused and atomic
- Include tests for new features
- Update documentation as needed

### Pull Requests

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation

3. **Test your changes:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```

4. **Submit a pull request:**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots for UI changes

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   └── page.tsx        # Home page
├── components/         # Reusable components
├── lib/               # Utility functions and configurations
│   ├── bot.ts         # Trading bot logic
│   ├── exchange.ts    # Exchange integration
│   ├── prisma.ts      # Database client
│   └── utils.ts       # Utility functions
└── types/             # TypeScript type definitions
```

## Areas for Contribution

### High Priority

- [ ] Add more trading strategies
- [ ] Implement WebSocket for real-time updates
- [ ] Add user authentication and authorization
- [ ] Create mobile-responsive design improvements
- [ ] Add comprehensive test coverage
- [ ] Implement error monitoring and logging

### Medium Priority

- [ ] Add more exchange integrations
- [ ] Create advanced charting features
- [ ] Add portfolio management
- [ ] Implement risk management tools
- [ ] Add notification system
- [ ] Create API documentation

### Low Priority

- [ ] Add dark mode theme
- [ ] Create mobile app
- [ ] Add social features
- [ ] Implement backtesting
- [ ] Add more language support

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API routes
- Write component tests for React components
- Aim for high test coverage

## Documentation

### Code Documentation

- Use JSDoc for function documentation
- Add inline comments for complex logic
- Keep README files up to date
- Update API documentation for new endpoints

### Contributing to Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep documentation organized

## Bug Reports

When reporting bugs, please include:

1. **Description:** Clear description of the issue
2. **Steps to reproduce:** Detailed steps to reproduce the bug
3. **Expected behavior:** What should happen
4. **Actual behavior:** What actually happens
5. **Environment:** OS, Node.js version, browser, etc.
6. **Screenshots:** If applicable

## Feature Requests

When requesting features, please include:

1. **Description:** Clear description of the feature
2. **Use case:** Why this feature would be useful
3. **Proposed solution:** How you think it should work
4. **Alternatives:** Other solutions you've considered
5. **Additional context:** Any other relevant information

## Code Review Process

1. **Automated checks:** All PRs must pass automated checks
2. **Code review:** At least one maintainer must review
3. **Testing:** New features must include tests
4. **Documentation:** Documentation must be updated
5. **Approval:** Maintainer approval required to merge

## Release Process

1. **Version bump:** Update version in package.json
2. **Changelog:** Update CHANGELOG.md
3. **Tag:** Create git tag for release
4. **Deploy:** Deploy to production
5. **Announce:** Announce release to community

## Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Report inappropriate behavior

## Getting Help

- **GitHub Issues:** For bugs and feature requests
- **Discussions:** For questions and general discussion
- **Discord:** For real-time chat (if available)
- **Email:** For private matters

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## Thank You

Thank you for contributing to the Crypto Trading Bot project! Your contributions help make this project better for everyone.

---

**Happy coding! 🚀**
