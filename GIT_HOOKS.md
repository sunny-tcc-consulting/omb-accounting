# Git Hooks Guide

This document describes the git hooks used in the omb-accounting project and how to use them.

## Overview

Git hooks are scripts that run automatically before or after certain git operations. The project uses git hooks to enforce code quality standards and ensure best practices.

## Available Hooks

### Pre-commit Hook

Runs before staging files for commit.

**What it does**:

- Runs lint-staged on staged files
- Runs all tests
- Validates commit message format

**Files**:

- `.husky/pre-commit`

**Trigger**: Before staging files with `git add`

**Exit Code**: 0 if all checks pass, 1 if any check fails

**Example**:

```bash
# Stage files
git add src/components/Invoice.tsx

# Try to commit
git ci "feat(invoice): add new component"

# Pre-commit hook runs:
# 1. lint-staged checks staged files
# 2. npm test runs all tests
# 3. commitlint validates commit message

# If any check fails, commit is blocked
```

### Commit-msg Hook

Validates commit message format.

**What it does**:

- Uses commitlint to validate commit message format
- Ensures conventional commit format

**Files**:

- `.husky/commit-msg`

**Trigger**: Before creating commit

**Exit Code**: 0 if format is valid, 1 if format is invalid

**Example**:

```bash
# Try to commit with invalid message
git ci "update invoice"

# Commit-msg hook runs:
# 1. commitlint validates message
# 2. Fails because "update" is not a valid commit type

# Error message:
# error   commit message should be prefixed with type   update invoice
```

### Pre-push Hook

Runs before pushing to remote.

**What it does**:

- Runs all tests
- Ensures code quality before pushing

**Files**:

- `.husky/pre-push`

**Trigger**: Before pushing with `git push`

**Exit Code**: 0 if tests pass, 1 if tests fail

**Example**:

```bash
# Try to push with failing tests
git push origin feature/your-branch

# Pre-push hook runs:
# 1. npm test runs all tests

# If tests fail, push is blocked
```

## How to Run Hooks

### Automatically

Hooks run automatically when you run git commands:

```bash
# Pre-commit hook runs automatically
git add .
git ci "feat(invoice): add PDF generation"

# Commit-msg hook runs automatically
git ci "feat(invoice): add PDF generation"

# Pre-push hook runs automatically
git push origin feature/your-branch
```

### Manually

You can run hooks manually:

```bash
# Run pre-commit hook
npx husky run pre-commit

# Run commit-msg hook
npx husky run commit-msg

# Run pre-push hook
npx husky run pre-push
```

## Pre-commit Checks

### What Gets Checked

1. **Linting**: ESLint checks staged files
2. **Formatting**: Prettier formats files
3. **Tests**: All tests must pass
4. **Commit Message**: Must follow conventional format

### Check Details

#### 1. Linting

Runs ESLint on staged files:

```bash
npx eslint src/components/Invoice.tsx --fix
```

**What it checks**:

- Code style
- Syntax errors
- Best practices
- Potential bugs

**Exit Code**: 0 if no errors, 1 if errors found

#### 2. Formatting

Runs Prettier on staged files:

```bash
npx prettier --write src/components/Invoice.tsx
```

**What it checks**:

- Code formatting
- Consistent style
- Indentation
- Spacing

**Exit Code**: 0 if formatted, 1 if already formatted

#### 3. Tests

Runs all tests:

```bash
npm test
```

**What it checks**:

- Unit tests
- Integration tests
- End-to-end tests
- Test coverage

**Exit Code**: 0 if all tests pass, 1 if tests fail

#### 4. Commit Message

Validates commit message format:

```bash
npx commitlint --edit .git/COMMIT_EDITMSG
```

**What it checks**:

- Commit type (feat, fix, docs, etc.)
- Scope (invoice, quotation, etc.)
- Subject format
- Body format

**Exit Code**: 0 if valid, 1 if invalid

### How to Fix Check Failures

#### Linting Errors

```bash
# Run linter
npm run lint

# Fix linting errors
npm run lint -- --fix

# Or run ESLint with fix
npx eslint src --fix

# Commit fixes
git ci "fix: resolve linting errors"
```

#### Formatting Issues

```bash
# Run Prettier
npx prettier --write .

# Or format specific files
npx prettier --write src/components/Invoice.tsx

# Commit fixes
git ci "style: apply prettier formatting"
```

#### Test Failures

```bash
# Run tests to see failures
npm test

# Fix failing tests
# Edit files...

# Run tests again
npm test

# Commit fixes
git ci "fix: resolve test failures"
```

#### Commit Message Format Errors

```bash
# Fix commit message format
git ci --amend

# Use conventional commit format:
# <type>(<scope>): <subject>

# Example:
git ci "feat(invoice): add PDF generation"
```

## Disabling Hooks

### Temporarily Disable Pre-commit Hook

```bash
# Commit without running pre-commit hook
git ci --no-verify -m "feat(invoice): add PDF generation"
```

### Temporarily Disable Commit-msg Hook

```bash
# Commit without running commit-msg hook
git ci --no-verify -m "feat(invoice): add PDF generation"
```

### Temporarily Disable Pre-push Hook

```bash
# Push without running pre-push hook
git push --no-verify
```

### Disable All Hooks

```bash
# Disable all hooks
git config --local core.hooksPath /dev/null

# Re-enable hooks
git config --local core.hooksPath .husky
```

**Warning**: Disabling hooks is not recommended for production code.

## Customizing Hooks

### Modifying Pre-commit Hook

Edit `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

# Add custom checks
echo "Running custom checks..."

# Run lint-staged
npx lint-staged

# Run tests
npm test

# Add custom validation
if [ $some_condition ]; then
  echo "Custom check failed"
  exit 1
fi

# Exit with error if any check fails
if [ $? -ne 0 ]; then
  echo "Pre-commit checks failed. Please fix the issues above."
  exit 1
fi
```

### Modifying Commit-msg Hook

Edit `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

# Run commitlint
npx --no -- commitlint --edit "$1"

# Add custom validation
if [ $some_condition ]; then
  echo "Custom validation failed"
  exit 1
fi
```

### Adding New Hooks

Create new hook files in `.husky/`:

```bash
# Pre-commit
npx husky add .husky/pre-commit "your-script"

# Commit-msg
npx husky add .husky/commit-msg "your-script"

# Pre-push
npx husky add .husky/pre-push "your-script"

# Post-commit
npx husky add .husky/post-commit "your-script"

# Post-merge
npx husky add .husky/post-merge "your-script"

# Post-rewrite
npx husky add .husky/post-rewrite "your-script"
```

## Common Hook Scripts

### Pre-commit Script

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run tests
npm test

# Exit with error if any check fails
if [ $? -ne 0 ]; then
  echo "Pre-commit checks failed. Please fix the issues above."
  exit 1
fi
```

### Commit-msg Script

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

# Run commitlint
npx --no -- commitlint --edit "$1"

# Exit with error if validation fails
if [ $? -ne 0 ]; then
  echo "Commit message format is invalid. Please follow conventional commit format."
  echo "Format: <type>(<scope>): <subject>"
  echo "Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert"
  exit 1
fi
```

### Pre-push Script

```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

# Run tests
npm test

# Exit with error if tests fail
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the issues above before pushing."
  exit 1
fi
```

## Troubleshooting

### Hook Not Running

**Symptoms**:

- Hook doesn't run when expected
- Hook runs but doesn't check correctly

**Solution**:

```bash
# Check if hooks are initialized
ls -la .husky/

# Check hook scripts are executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

# Verify hook scripts
cat .husky/pre-commit
cat .husky/commit-msg
cat .husky/pre-push
```

### Hook Fails Unexpectedly

**Symptoms**:

- Hook fails even though code is correct
- Hook fails with cryptic error messages

**Solution**:

```bash
# Run hook manually to see error
npx husky run pre-commit

# Run individual checks
npx lint-staged
npm test
npx commitlint --edit .git/COMMIT_EDITMSG

# Check for common issues
# - Missing dependencies
# - Incorrect file paths
# - Permission issues
```

### Hook Passes but Code Quality is Poor

**Symptoms**:

- Hook passes but code has issues

**Solution**:

- Check hook configuration
- Verify lint-staged configuration
- Review hook scripts

### Hook Too Slow

**Symptoms**:

- Hook takes too long to run

**Solution**:

```bash
# Optimize lint-staged configuration
# Run only on staged files, not all files

# Run tests in parallel
npm test -- --watchAll=false

# Cache results if possible
```

## Best Practices

### For Maintainers

1. **Keep Hooks Simple**:
   - Don't over-engineer hooks
   - Keep scripts focused
   - Avoid complex logic

2. **Document Hooks**:
   - Document what each hook does
   - Document how to customize
   - Document troubleshooting

3. **Test Hooks**:
   - Test hooks locally
   - Test hooks in CI
   - Update hooks regularly

4. **Maintain Hooks**:
   - Keep hooks up-to-date
   - Fix broken hooks
   - Remove unused hooks

### For Contributors

1. **Don't Disable Hooks**:
   - Hooks exist for a reason
   - Fix issues instead of disabling
   - Ask if you're unsure

2. **Run Hooks Manually**:
   - Run hooks to see what they check
   - Understand the checks
   - Learn from errors

3. **Report Hook Issues**:
   - Report broken hooks
   - Suggest improvements
   - Provide examples

4. **Follow Hook Rules**:
   - Follow commit message format
   - Fix linting errors
   - Pass all tests

## Hook Configuration

### Husky Configuration

Husky is configured in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### lint-staged Configuration

Configuration in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm run test -- --passWithNoTests"
    ],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Commitlint Configuration

Configuration in `.commitlintrc.json`:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci",
        "revert"
      ]
    ],
    "subject-case": [0],
    "header-max-length": [2, "always", 72]
  }
}
```

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Git-Internals-Git-Hooks)
