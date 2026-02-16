# Pre-commit Checks Guide

This document describes the pre-commit checks used in the omb-accounting project.

## Overview

Pre-commit checks are automated validations that run before each commit to ensure code quality and consistency.

## What Gets Checked

### 1. Linting

**Tool**: ESLint

**Purpose**: Check code for style errors, syntax errors, and potential bugs

**Files Checked**: Staged files (`.ts`, `.tsx`, `.js`, `.jsx`)

**How to Run**:

```bash
npm run lint
```

**Exit Code**:

- 0: No errors
- 1: Errors found

**Example Output**:

```
Oops! Something went wrong! :(
ESLint: 9.x.x

✖ 4 problems (4 errors, 0 warnings)

  1 problem in src/components/Invoice.tsx
  1 problem in src/lib/utils.ts
  2 problems in src/app/(dashboard)/invoices/page.tsx

  src/components/Invoice.tsx
    15:15  error  Missing semicolon  @typescript-eslint/semi

  src/lib/utils.ts
    23:5   error  Unexpected console statement  no-console

  src/app/(dashboard)/invoices/page.tsx
    45:3   error  Unexpected console statement  no-console
    78:7   error  Unexpected console statement  no-console
```

**How to Fix**:

```bash
# Auto-fix linting errors
npm run lint -- --fix

# Or run ESLint with fix
npx eslint src --fix

# Manually fix errors
# Edit files to fix linting issues
```

### 2. Formatting

**Tool**: Prettier

**Purpose**: Ensure consistent code formatting

**Files Checked**: Staged files (`.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.css`)

**How to Run**:

```bash
npx prettier --check .
```

**Exit Code**:

- 0: Files are properly formatted
- 1: Files need formatting

**Example Output**:

```
Checking formatting...
src/components/Invoice.tsx
src/lib/utils.ts
src/app/(dashboard)/invoices/page.tsx
All files were formatted with Prettier!
```

**How to Fix**:

```bash
# Format all files
npx prettier --write .

# Format specific files
npx prettier --write src/components/Invoice.tsx

# Check specific files
npx prettier --check src/components/Invoice.tsx
```

### 3. Tests

**Tool**: Jest

**Purpose**: Ensure all tests pass

**Files Checked**: All test files

**How to Run**:

```bash
npm test
```

**Exit Code**:

- 0: All tests pass
- 1: Some tests fail

**Example Output**:

```
PASS  src/__tests__/InvoiceContext.test.tsx
PASS  src/__tests__/quotation-utils.test.ts
PASS  src/__tests__/pdf-generator.test.ts

Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        0.281 s
```

**How to Fix**:

```bash
# Run tests to see failures
npm test

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Fix failing tests
# Edit files to fix test issues
# Run tests again
npm test
```

### 4. Commit Message Format

**Tool**: commitlint

**Purpose**: Ensure commit messages follow conventional format

**Files Checked**: Commit message

**How to Run**:

```bash
npx commitlint --edit .git/COMMIT_EDITMSG
```

**Exit Code**:

- 0: Format is valid
- 1: Format is invalid

**Format**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Valid Types**:

- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- perf: Performance improvements
- test: Adding or updating tests
- chore: Maintenance tasks
- ci: CI/CD changes
- revert: Revert a previous commit

**Valid Scopes**:

- invoice
- quotation
- customer
- context
- ui
- hooks
- types
- utils

**Example Valid Message**:

```
feat(invoice): add PDF generation
```

**Example Invalid Message**:

```
update invoice
```

**How to Fix**:

```bash
# Amend commit with correct format
git ci --amend

# Use conventional commit format
# Example:
git ci "feat(invoice): add PDF generation"
```

## How Checks Work Together

### Pre-commit Hook Execution

```bash
# 1. Stage files
git add src/components/Invoice.tsx

# 2. Try to commit
git ci "feat(invoice): add new component"

# 3. Pre-commit hook runs:
#    a. lint-staged runs ESLint on staged files
#       - If ESLint fails, commit is blocked
#       - If ESLint passes, continue
#
#    b. lint-staged runs Prettier on staged files
#       - If Prettier finds formatting issues, commit is blocked
#       - If Prettier passes, continue
#
#    c. npm test runs all tests
#       - If tests fail, commit is blocked
#       - If tests pass, continue
#
#    d. commitlint validates commit message
#       - If format is invalid, commit is blocked
#       - If format is valid, commit proceeds
```

### Exit Code Flow

```
lint-staged (ESLint)
  ↓
  Pass? → No → Block commit, show errors
  ↓ Yes
lint-staged (Prettier)
  ↓
  Pass? → No → Block commit, show formatting issues
  ↓ Yes
npm test
  ↓
  Pass? → No → Block commit, show test failures
  ↓ Yes
commitlint
  ↓
  Valid? → No → Block commit, show format errors
  ↓ Yes
Commit proceeds successfully
```

## How to Run Checks Manually

### Run All Checks

```bash
# Run pre-commit hook manually
npx husky run pre-commit
```

### Run Individual Checks

```bash
# Run linting
npm run lint

# Run formatting
npx prettier --check .

# Run tests
npm test

# Run commit message validation
npx commitlint --edit .git/COMMIT_EDITMSG
```

### Run Specific Staged Files

```bash
# Run lint-staged on staged files
npx lint-staged
```

## How to Disable Checks

### Temporarily Disable All Checks

```bash
# Commit without running pre-commit hook
git ci --no-verify -m "feat(invoice): add new component"
```

### Temporarily Disable Individual Checks

```bash
# Disable linting
# Edit .husky/pre-commit and comment out lint-staged line

# Disable formatting
# Edit .husky/pre-commit and comment out prettier line

# Disable tests
# Edit .husky/pre-commit and comment out npm test line

# Disable commit message validation
# Edit .husky/commit-msg and comment out commitlint line
```

## Common Issues and Solutions

### Issue 1: ESLint Errors

**Symptoms**:

```
Oops! Something went wrong! :(
ESLint: 9.x.x

✖ 4 problems (4 errors, 0 warnings)
```

**Solution**:

```bash
# Run linter
npm run lint

# Fix automatically
npm run lint -- --fix

# Manually fix errors
# Edit files to fix linting issues
```

### Issue 2: Formatting Issues

**Symptoms**:

```
Checking formatting...
src/components/Invoice.tsx
src/lib/utils.ts
src/app/(dashboard)/invoices/page.tsx
```

**Solution**:

```bash
# Format all files
npx prettier --write .

# Format specific files
npx prettier --write src/components/Invoice.tsx
```

### Issue 3: Test Failures

**Symptoms**:

```
FAIL  src/__tests__/InvoiceContext.test.tsx
  ● InvoiceContext › should add invoice

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false
```

**Solution**:

```bash
# Run tests to see failures
npm test

# Fix failing tests
# Edit files to fix test issues

# Run tests again
npm test
```

### Issue 4: Invalid Commit Message

**Symptoms**:

```
error   commit message should be prefixed with type   update invoice
```

**Solution**:

```bash
# Amend commit with correct format
git ci --amend

# Use conventional commit format
# Example:
git ci "feat(invoice): add PDF generation"
```

### Issue 5: Hook Not Running

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

## Check Configuration

### ESLint Configuration

**File**: `eslint.config.mjs` or `.eslintrc.*`

**Purpose**: Configure linting rules

**Example**:

```javascript
export default [
  {
    ignores: ["node_modules/", ".next/", "*.config.js"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: { ts: tsParser },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/semi": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];
```

### Prettier Configuration

**File**: `prettier.config.mjs` or `.prettierrc`

**Purpose**: Configure formatting rules

**Example**:

```javascript
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
};
```

### Jest Configuration

**File**: `jest.config.js`

**Purpose**: Configure test runner

**Example**:

```javascript
export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Commitlint Configuration

**File**: `.commitlintrc.json`

**Purpose**: Configure commit message validation

**Example**:

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

## Best Practices

### For Maintainers

1. **Keep Checks Relevant**:
   - Don't add unnecessary checks
   - Remove unused checks
   - Keep checks up-to-date

2. **Make Checks Fast**:
   - Optimize lint-staged to only check staged files
   - Run tests in parallel where possible
   - Cache results where appropriate

3. **Provide Clear Error Messages**:
   - Explain what check failed
   - Explain how to fix
   - Provide examples

4. **Document Checks**:
   - Document what each check does
   - Document how to fix failures
   - Document common issues

### For Contributors

1. **Don't Disable Checks**:
   - Checks exist for a reason
   - Fix issues instead of disabling
   - Ask if you're unsure

2. **Run Checks Manually**:
   - Run checks to see what they check
   - Understand the checks
   - Learn from errors

3. **Address Check Failures**:
   - Fix linting errors
   - Format code
   - Fix tests
   - Fix commit messages

4. **Follow Check Rules**:
   - Follow commit message format
   - Fix linting errors
   - Pass all tests

## Check Coverage

### Current Checks

- [x] ESLint for linting
- [x] Prettier for formatting
- [x] Jest for testing
- [x] commitlint for commit messages

### Recommended Checks

- [ ] TypeScript type checking
- [ ] Security scanning
- [ ] Performance checks
- [ ] Accessibility checks
- [ ] Build verification

## Troubleshooting Checklist

If checks are failing:

1. **Check for common issues**:
   - Missing dependencies
   - Incorrect file paths
   - Permission issues
   - Configuration errors

2. **Run checks manually**:
   - Run ESLint to see errors
   - Run Prettier to see formatting issues
   - Run tests to see test failures
   - Run commitlint to see format errors

3. **Fix issues**:
   - Fix linting errors
   - Format code
   - Fix tests
   - Fix commit messages

4. **Verify fixes**:
   - Run checks again
   - Ensure all checks pass
   - Commit only when ready

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
