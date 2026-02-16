# Technical Implementation Plan: Git Workflow Best Practices

## Overview

Implement a disciplined git workflow with automated checks, conventional commits, and feature branch strategy to ensure maintainable and collaborative development.

## Tech Stack

- **Git**: Version control system (existing)
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files
- **commitlint**: Validate commit messages
- **@commitlint/cli**: Commit message validation
- **@commitlint/config-conventional**: Conventional commits configuration
- **@types/node**: TypeScript types for Node.js (if needed)

## Implementation Steps

### Step 1: Initialize Git Hooks with Husky

**Files to Create/Modify**:

- `package.json`: Add husky and lint-staged dependencies
- `.husky/`: Create husky hooks directory
- `.husky/pre-commit`: Pre-commit validation script
- `.husky/commit-msg`: Commit message validation script
- `.husky/pre-push`: Pre-push validation script

**Implementation Details**:

1. **Install Dependencies**:

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional @commitlint/cli
npx husky install
```

2. **Configure Husky**:

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "npx --no -- commitlint --edit \$1"
npx husky add .husky/pre-push "npm test"
```

3. **Configure lint-staged** in `package.json`:

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

### Step 2: Configure Commitlint

**Files to Create**:

- `.commitlintrc.json`: Commitlint configuration

**Implementation Details**:

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

### Step 3: Configure Git Configuration

**Files to Create/Modify**:

- `.gitconfig`: Project-specific git configuration
- `.gitignore`: Ensure proper exclusions

**Implementation Details**:

1. **User Configuration**:

```bash
git config user.name "omb-accounting-dev"
git config user.email "omb-accounting@example.com"
```

2. **Alias Configuration**:

```bash
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage 'reset HEAD --'
git config alias.last 'log -1 HEAD'
```

3. **Git Hooks Configuration**:

```bash
# Pre-commit hook
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

### Step 4: Create Branch Strategy

**Branch Naming Convention**:

- `main`: Production branch (protected)
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `docs/*`: Documentation updates
- `test/*`: Testing and validation

**Implementation Steps**:

1. **Create main branch** (if not exists):

```bash
git checkout -b main
git push -u origin main
```

2. **Configure branch protection** (on remote):

- Require pull request reviews
- Require status checks to pass
- Prevent force pushes
- Require branch to be up-to-date

### Step 5: Create Pull Request Templates

**Files to Create**:

- `.github/PULL_REQUEST_TEMPLATE.md`: PR template
- `.github/ISSUE_TEMPLATE/feature_request.md`: Feature request template
- `.github/ISSUE_TEMPLATE/bug_report.md`: Bug report template

**Implementation Details**:

1. **PR Template**:

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

2. **Feature Request Template**:

```markdown
## Feature Request

**Is your feature request related to a problem? Please describe.**

## Proposed Solution

**Describe how you would implement this feature.**

## Use Cases

**Describe specific use cases for this feature.**

## Additional Information

**Any other context or screenshots.**
```

### Step 6: Create Git Workflow Documentation

**Files to Create**:

- `GIT_WORKFLOW.md`: Main git workflow guide
- `COMMIT_MESSAGE_GUIDE.md`: Detailed commit message guide
- `BRANCH_STRATEGY.md`: Branch strategy documentation
- `PULL_REQUEST_GUIDE.md`: PR process guide

**Implementation Details**:

1. **GIT_WORKFLOW.md**:

- Overview of git workflow
- Branch strategy
- Commit conventions
- Pull request process
- Common git commands

2. **COMMIT_MESSAGE_GUIDE.md**:

- Conventional commit format explanation
- Type definitions
- Examples of good and bad commits
- Tips for writing effective commit messages

3. **BRANCH_STRATEGY.md**:

- Branch naming conventions
- Workflow diagram
- When to use each branch type
- Merge strategies

4. **PULL_REQUEST_GUIDE.md**:

- PR requirements
- Review process
- Approval criteria
- Merge process

### Step 7: Create Git Hooks Documentation

**Files to Create**:

- `GIT_HOOKS.md`: Documentation for git hooks
- `PRE_COMMIT_CHECKS.md`: Pre-commit checks documentation
- `COMMIT_MESSAGE_VALIDATION.md`: Commit message validation documentation

**Implementation Details**:

1. **GIT_HOOKS.md**:

- Overview of available hooks
- How to run hooks manually
- Troubleshooting common issues

2. **PRE_COMMIT_CHECKS.md**:

- List of pre-commit checks
- How to run them individually
- How to disable temporarily

## Data Models

### Git Configuration Structure

```
omb-accounting/
├── .husky/
│   ├── pre-commit          # Pre-commit validation
│   ├── commit-msg          # Commit message validation
│   ├── pre-push            # Pre-push validation
│   └── _/husky.sh          # Husky initialization
├── .commitlintrc.json      # Commitlint configuration
├── .gitignore              # Git ignore rules
├── .gitattributes          # Git attributes
├── package.json            # Dependencies (husky, lint-staged, commitlint)
└── GIT_WORKFLOW.md         # Documentation
```

## API/Interface Contracts

### Git Hooks

**Pre-commit Hook**:

- **Trigger**: Before staging files for commit
- **Inputs**: Staged files
- **Outputs**: Validation results (pass/fail)
- **Actions**:
  - Run lint-staged on staged files
  - Run tests
  - Validate commit message format
  - Exit with error if any check fails

**Commit-msg Hook**:

- **Trigger**: Before creating commit
- **Inputs**: Commit message
- **Outputs**: Validation results (pass/fail)
- **Actions**:
  - Validate commit message format using commitlint
  - Exit with error if format is invalid

**Pre-push Hook**:

- **Trigger**: Before pushing commits to remote
- **Inputs**: Branch being pushed
- **Outputs**: Validation results (pass/fail)
- **Actions**:
  - Run all tests
  - Ensure code coverage meets threshold
  - Exit with error if any check fails

## Security Considerations

### Git Credentials

- Use SSH keys instead of HTTPS for authentication
- Store credentials in environment variables
- Never commit credentials to repository

### Git Hooks Security

- Verify hook scripts before running
- Use trusted package managers
- Review hook scripts for malicious code

### Branch Protection

- Enable branch protection on main branch
- Require pull requests for changes
- Require status checks to pass
- Prevent force pushes

## Performance Considerations

### Pre-commit Check Performance

- Use lint-staged to only check staged files
- Run tests in parallel where possible
- Cache results where appropriate
- Set timeouts for slow operations

### Git Operations

- Use shallow clones for faster operations
- Optimize git configuration for performance
- Use git hooks to prevent unnecessary operations

## Testing Strategy

### Unit Tests

- Test git hook scripts
- Test commit message validation
- Test lint-staged configuration

### Integration Tests

- Test complete git workflow
- Test pre-commit, commit-msg, pre-push hooks
- Test branch creation and merging

### Manual Testing

- Verify git hooks work as expected
- Test commit message validation
- Test branch strategy in practice
- Test pull request process

## Deployment Strategy

### Phase 1: Setup

1. Install husky and related packages
2. Configure git hooks
3. Configure commitlint
4. Test hooks locally

### Phase 2: Documentation

1. Create git workflow documentation
2. Create commit message guide
3. Create branch strategy guide
4. Train team on new workflow

### Phase 3: Implementation

1. Enforce git hooks for all commits
2. Configure branch protection
3. Set up pull request templates
4. Monitor compliance

### Phase 4: Refinement

1. Collect feedback from team
2. Improve workflow based on feedback
3. Update documentation
4. Iterate on git configuration

## Success Criteria

- [ ] All commits follow conventional commit format
- [ ] Pre-commit hooks prevent commits with failing checks
- [ ] Commit message validation catches invalid formats
- [ ] Feature branches are used for all new work
- [ ] Pull requests are created for all changes to main
- [ ] Branch protection is configured on main branch
- [ ] Team follows git workflow consistently

## References

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Workflows)
