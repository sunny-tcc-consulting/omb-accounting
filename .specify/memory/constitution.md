# Project Constitution: omb-accounting

## Core Principles

### 1. Code Quality & Maintainability

- **Principle**: Write clean, readable, and maintainable code
- **Guidelines**:
  - Follow TypeScript best practices and strict type checking
  - Use meaningful variable and function names
  - Write clear and concise code comments
  - Avoid code duplication (DRY principle)
  - Keep functions focused and small (Single Responsibility Principle)

### 2. Testing Standards

- **Principle**: Achieve comprehensive test coverage (80%+)
- **Guidelines**:
  - Write unit tests before implementation (Test-Driven Development)
  - Test all critical business logic
  - Use meaningful test names
  - Maintain test independence
  - Keep tests fast and focused

### 3. User Experience Consistency

- **Principle**: Deliver a polished, intuitive user experience
- **Guidelines**:
  - Maintain consistent UI patterns across all pages
  - Use shadcn/ui components for consistency
  - Provide clear feedback and error messages
  - Ensure responsive design for all devices
  - Follow accessibility standards (WCAG 2.1 AA)

### 4. Performance Requirements

- **Principle**: Ensure optimal performance for all features
- **Guidelines**:
  - Optimize bundle size and load times
  - Implement proper code splitting
  - Use lazy loading for heavy components
  - Cache where appropriate
  - Monitor and optimize render performance

### 5. Git Workflow Standards

- **Principle**: Maintain a disciplined and traceable development workflow
- **Guidelines**:
  - Commit frequently with meaningful messages
  - Follow conventional commit format
  - Push to remote after each logical change
  - Use feature branches for new work
  - Keep main branch always deployable

## Git Workflow Governance

### Commit Message Standards

**Format**: `<type>(<scope>): <subject>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring (no behavior change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (builds, deps, scripts)
- `ci`: CI/CD changes
- `revert`: Revert a previous commit

**Examples**:

```
feat(invoice): add PDF generation functionality
fix(quotation): correct payment terms calculation
docs(readme): update installation instructions
refactor(context): improve state management structure
test(invoice): add comprehensive unit tests
```

### Branch Strategy

**Branches**:

- `main`: Production-ready code (always stable)
- `feature/*`: Feature development branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Critical production fixes
- `docs/*`: Documentation updates
- `test/*`: Testing and validation branches

**Workflow**:

1. Create feature branch from `main`
2. Make changes and commit frequently
3. Push branch to remote
4. Create pull request (PR) with clear description
5. Review and merge to `main` via PR

### Commit Frequency

- **Minimum**: Commit after each logical change
- **Recommended**: Commit every 30-60 minutes of work
- **Before Push**: Ensure all tests pass
- **After Major Feature**: Create a separate commit for documentation and tests

### Push Strategy

- **Push Frequency**: After each commit or logical set of commits
- **Remote Sync**: Pull latest changes before starting new work
- **Branch Protection**: Require approval for main branch changes
- **Commit History**: Keep commit history clean and meaningful

## Development Process

### Feature Development Lifecycle

1. **Specification** (Spec-Kit)
   - Define WHAT to build
   - Create user stories and acceptance criteria
   - Establish testing requirements

2. **Planning**
   - Create technical implementation plan
   - Define data models and APIs
   - Identify dependencies

3. **Implementation**
   - Follow TDD approach (tests first)
   - Implement features incrementally
   - Commit frequently with meaningful messages

4. **Testing**
   - Run all tests locally
   - Achieve target coverage
   - Validate against acceptance criteria

5. **Documentation**
   - Update relevant documentation
   - Add code comments
   - Create user guides if needed

6. **Git Workflow**
   - Commit changes with conventional format
   - Push to remote
   - Create pull request
   - Review and merge

### Code Review Standards

- **PR Requirements**:
  - Clear title and description
  - Link to specification and tasks
  - All tests passing
  - No linting errors
  - Code follows project conventions

- **Review Checklist**:
  - Code meets acceptance criteria
  - Tests cover new functionality
  - No security concerns
  - Performance implications considered
  - Documentation updated if needed

## Quality Gates

### Pre-Commit Checks

- [ ] Code compiles without errors
- [ ] TypeScript strict mode enabled
- [ ] All tests pass
- [ ] Linting passes with zero warnings
- [ ] Commit message follows conventional format

### Pre-Push Checks

- [ ] All tests pass locally
- [ ] Code coverage meets threshold
- [ ] No console errors in browser
- [ ] Responsive design verified
- [ ] Accessibility tested

### Pre-Merge Checks

- [ ] All PR requirements met
- [ ] Code review approved
- [ ] Tests passing in CI/CD
- [ ] Documentation updated
- [ ] No breaking changes to public API

## Continuous Improvement

- **Weekly**: Review git history and commit patterns
- **Monthly**: Update development guidelines based on learnings
- **Quarterly**: Evaluate and improve development workflow
- **Always**: Learn from mistakes and refine processes

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Workflows)
- [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
