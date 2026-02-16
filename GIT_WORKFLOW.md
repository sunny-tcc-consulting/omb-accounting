# Git Workflow Best Practices

## Overview

This document describes the git workflow and commit conventions used in the omb-accounting project. Following these practices ensures maintainable, traceable, and collaborative development.

## Branch Strategy

### Branch Types

- **`main`**: Production-ready code (always stable)
  - Protected branch
  - Requires pull request for changes
  - Requires status checks to pass

- **`feature/*`**: New features and improvements
  - Created from `main`
  - Named: `feature/<feature-name>`
  - Example: `feature/pdf-generation`

- **`bugfix/*`**: Bug fixes
  - Created from `main`
  - Named: `bugfix/<bug-name>`
  - Example: `bugfix/payment-terms`

- **`hotfix/*`**: Critical production fixes
  - Created from `main`
  - Named: `hotfix/<issue-name>`
  - Example: `hotfix/security-patch`

- **`docs/*`**: Documentation updates
  - Created from `main`
  - Named: `docs/<topic>`
  - Example: `docs/git-workflow`

- **`test/*`**: Testing and validation
  - Created from `main`
  - Named: `test/<purpose>`
  - Example: `test/e2e-tests`

### Branch Workflow

1. **Create feature branch**:

   ```bash
   git checkout -b feature/<feature-name>
   ```

2. **Develop on feature branch**:

   ```bash
   # Make changes
   # Commit frequently with meaningful messages
   ```

3. **Push to remote**:

   ```bash
   git push -u origin feature/<feature-name>
   ```

4. **Create pull request**:
   - Open PR from feature branch to `main`
   - Provide clear description and context
   - Link to related issues
   - Ensure all checks pass

5. **Merge via PR**:
   - Wait for code review
   - Address feedback
   - Get approval
   - Merge to `main`

## Commit Message Standards

### Format

All commits must follow the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Definitions

- **`feat`**: New feature
  - Example: `feat(invoice): add PDF generation functionality`

- **`fix`**: Bug fix
  - Example: `fix(quotation): correct payment terms calculation`

- **`docs`**: Documentation changes
  - Example: `docs(readme): update installation instructions`

- **`style`**: Code style changes (formatting, no logic changes)
  - Example: `style(code): apply prettier formatting`

- **`refactor`**: Code refactoring (no behavior change)
  - Example: `refactor(context): improve state management structure`

- **`perf`**: Performance improvements
  - Example: `perf(invoice): optimize PDF generation performance`

- **`test`**: Adding or updating tests
  - Example: `test(invoice): add comprehensive unit tests`

- **`chore`**: Maintenance tasks (builds, deps, scripts)
  - Example: `chore(deps): update lodash to v4.17.21`

- **`ci`**: CI/CD changes
  - Example: `ci(github): add automated testing workflow`

- **`revert`**: Revert a previous commit
  - Example: `revert: feat(invoice): add PDF generation functionality`

### Scope

The scope indicates the affected area of the codebase:

- `invoice`: Invoice-related changes
- `quotation`: Quotation-related changes
- `customer`: Customer-related changes
- `context`: Context management
- `ui`: UI components
- `hooks`: React hooks
- `types`: TypeScript types
- `utils`: Utility functions

### Subject

- Use imperative mood (e.g., "add" instead of "added" or "adds")
- Be concise (under 50 characters)
- Start with a capital letter
- End with a period
- No exclamation marks

### Body

- Add a blank line after the subject
- Explain what and why, not how
- Use bullet points for multiple changes
- Keep body concise (under 72 characters per line)

### Footer

- Use `Closes #<issue-number>` to close an issue
- Use `Fixes #<issue-number>` to fix an issue
- Use `Refs #<issue-number>` to reference an issue

### Examples

#### Good Commit Messages

```
feat(invoice): add PDF generation functionality

Add ability to generate PDF invoices from invoice data.
Uses jsPDF and jsPDF-AutoTable for professional formatting.
Includes print preview and download functionality.

Closes #123
```

```
fix(quotation): correct payment terms calculation

The due date was not being calculated correctly for COD
payment terms. Now properly returns the current date for COD.

Fixes #124
```

```
refactor(context): improve state management structure

Refactor InvoiceContext and QuotationContext to use
separate providers for better separation of concerns.
Maintains backward compatibility.

Closes #125
```

#### Bad Commit Messages

```
update invoice
```

```
oops, fix that bug
```

```
feat: add PDF generation
```

```
add PDF generation feature
```

## Git Hooks

The project uses git hooks to enforce quality standards before each commit.

### Pre-commit Hook

Runs before staging files for commit:

- Runs lint-staged on staged files
- Runs all tests
- Fails if any check fails

**To run manually**:

```bash
npx husky run pre-commit
```

**To disable temporarily**:

```bash
git commit --no-verify -m "message"
```

### Commit-msg Hook

Validates commit message format:

- Uses commitlint to validate conventional commit format
- Fails if format is invalid

**To run manually**:

```bash
npx husky run commit-msg
```

**To disable temporarily**:

```bash
git commit --no-verify -m "message"
```

### Pre-push Hook

Runs before pushing to remote:

- Runs all tests
- Fails if tests fail

**To run manually**:

```bash
npx husky run pre-push
```

**To disable temporarily**:

```bash
git push --no-verify
```

## Git Aliases

The project provides convenient git aliases:

```bash
git co checkout          # Checkout branch
git br branch            # List branches
git ci commit            # Create commit
git st status            # Show status
git unstage 'reset HEAD --'  # Unstage files
git last 'log -1 HEAD'   # Show last commit
```

## Pre-commit Checks

### What Gets Checked

1. **Linting**: ESLint runs on staged files
2. **Formatting**: Prettier formats files
3. **Tests**: All tests must pass
4. **Commit Message**: Must follow conventional format

### How to Fix

1. **Linting Errors**:

   ```bash
   npm run lint
   ```

2. **Formatting Issues**:

   ```bash
   npx prettier --write .
   ```

3. **Test Failures**:

   ```bash
   npm test
   ```

4. **Commit Message Format**:
   - Follow the conventional commit format
   - Use the correct type (feat, fix, docs, etc.)
   - Include a meaningful subject

## Pull Request Guidelines

### PR Requirements

- Clear title and description
- Link to specification and tasks
- All tests passing
- No linting errors
- Code follows project conventions

### PR Checklist

- [ ] Clear description of changes
- [ ] Link to related issues
- [ ] All tests pass
- [ ] Code follows conventions
- [ ] Documentation updated if needed
- [ ] No console errors in browser
- [ ] Responsive design verified

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Test Results

- [ ] All tests pass
- [ ] No console errors
- [ ] Responsive design verified

## Screenshots (if applicable)

[Add screenshots of UI changes]
```

## Common Commands

### Branch Management

```bash
# Create new feature branch
git co -b feature/<feature-name>

# Switch to branch
git co <branch-name>

# List branches
git br

# Delete branch
git br -d <branch-name>

# Merge branch to main
git co main
git merge <branch-name>
```

### Committing

```bash
# Create commit with message
git ci "feat(invoice): add PDF generation"

# Create commit with multi-line message
git ci -m "feat(invoice): add PDF generation

Add ability to generate PDF invoices from invoice data.
Uses jsPDF and jsPDF-AutoTable for professional formatting.

Closes #123"

# Amend last commit
git ci --amend
```

### Pushing

```bash
# Push branch to remote
git push -u origin feature/<feature-name>

# Push all changes
git push

# Push with force (use with caution)
git push -f
```

### Pulling

```bash
# Pull latest changes
git pull

# Pull with rebase
git pull --rebase

# Pull specific branch
git pull origin main
```

### Undoing Changes

```bash
# Unstage files
git unstage <file>

# Reset to last commit
git reset HEAD

# Discard uncommitted changes
git checkout -- <file>

# Reset to previous commit
git reset --hard HEAD~1
```

## Troubleshooting

### Pre-commit Hook Fails

1. Check for linting errors:

   ```bash
   npm run lint
   ```

2. Check for formatting issues:

   ```bash
   npx prettier --check .
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Fix issues and try again

### Commit Message Format Error

1. Check commit message format
2. Use conventional commit format:
   ```
   <type>(<scope>): <subject>
   ```
3. Try again

### Tests Failing

1. Run tests to see failures:

   ```bash
   npm test
   ```

2. Fix failing tests
3. Commit fixes
4. Try again

## Best Practices

### Commit Frequently

- Commit after each logical change
- Aim for commits every 30-60 minutes
- Keep commits atomic and complete

### Write Meaningful Messages

- Describe what and why, not how
- Use imperative mood
- Be specific and concise

### Keep Branches Clean

- Resolve merge conflicts promptly
- Keep branch up-to-date with main
- Don't let branches become stale

### Use Feature Branches

- Always work on feature branches
- Don't commit directly to main
- Create PRs for all changes

### Review Before Merging

- Get code review before merging
- Address feedback promptly
- Ensure all checks pass

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Workflows)
- [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
