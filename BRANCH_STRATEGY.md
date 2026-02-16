# Branch Strategy Guide

This document describes the branch strategy and naming conventions used in the omb-accounting project.

## Overview

The project uses a feature branch workflow to maintain a stable main branch and isolate development work.

## Branch Types

### main

The production branch containing the latest stable code.

**Rules**:

- Always stable and deployable
- Protected branch (requires pull request)
- Requires status checks to pass
- No direct commits allowed

**Example**:

```
main
```

### feature/\*

Feature branches for implementing new features.

**Naming**:

- Format: `feature/<feature-name>`
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive

**Examples**:

```
feature/pdf-generation
feature/quotation-to-invoice
feature/customer-search
feature/dark-mode
```

**Workflow**:

1. Create from `main`
2. Work exclusively on this branch
3. Commit frequently
4. Push to remote
5. Create pull request to merge to `main`

### bugfix/\*

Bug fix branches for fixing bugs.

**Naming**:

- Format: `bugfix/<bug-name>`
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive

**Examples**:

```
bugfix/payment-terms
bugfix/quotation-number
bugfix/customer-deletion
bugfix/layout-issue
```

**Workflow**:

1. Create from `main`
2. Fix the bug
3. Test thoroughly
4. Create pull request to merge to `main`

### hotfix/\*

Hotfix branches for critical production fixes.

**Naming**:

- Format: `hotfix/<issue-name>`
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive

**Examples**:

```
hotfix/security-patch
hotfix/critical-bug
hotfix/payment-failure
hotfix/data-loss
```

**Workflow**:

1. Create from `main`
2. Fix the critical issue
3. Test thoroughly
4. Create pull request to merge to `main`
5. Merge to `develop` (if exists)
6. Tag the release

### docs/\*

Documentation update branches.

**Naming**:

- Format: `docs/<topic>`
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive

**Examples**:

```
docs/git-workflow
docs/api-documentation
docs/contribution-guide
docs/release-notes
```

**Workflow**:

1. Create from `main`
2. Update documentation
3. Create pull request to merge to `main`

### test/\*

Testing and validation branches.

**Naming**:

- Format: `test/<purpose>`
- Use lowercase letters
- Use hyphens to separate words
- Be descriptive

**Examples**:

```
test/e2e-tests
test/integration-tests
test/performance-tests
test/coverage-report
```

**Workflow**:

1. Create from `main`
2. Run tests
3. Create pull request to merge to `main`

## Branch Naming Conventions

### General Rules

1. **Lowercase**: Use only lowercase letters

   ```
   ✅ feature/pdf-generation
   ❌ Feature/PDF-Generation
   ❌ FEATURE/PDF_GENERATION
   ```

2. **Hyphens**: Use hyphens to separate words

   ```
   ✅ feature/pdf-generation
   ❌ feature/pdf_generation
   ❌ feature/pdf_generation_feature
   ```

3. **Descriptive**: Be clear and specific

   ```
   ✅ feature/quotation-to-invoice
   ❌ feature/new-feature
   ❌ feature/f
   ```

4. **No Special Characters**: Use only letters and hyphens

   ```
   ✅ feature/pdf-generation
   ❌ feature/pdf_generation
   ❌ feature/pdf#generation
   ```

5. **No Prefix Numbers**: Avoid numbering branches
   ```
   ✅ feature/pdf-generation
   ❌ feature/001-pdf-generation
   ❌ feature/v1-pdf-generation
   ```

### Common Patterns

**Feature branches**:

```
feature/pdf-generation
feature/quotation-to-invoice
feature/customer-search
feature/dark-mode
feature/export-csv
feature/real-time-updates
```

**Bug fix branches**:

```
bugfix/payment-terms
bugfix/quotation-number
bugfix/customer-deletion
bugfix/layout-issue
bugfix/security-vulnerability
```

**Hotfix branches**:

```
hotfix/security-patch
hotfix/critical-bug
hotfix/payment-failure
hotfix/data-loss
hotfix/critical-performance-issue
```

**Documentation branches**:

```
docs/git-workflow
docs/api-documentation
docs/contribution-guide
docs/release-notes
docs/development-guide
```

**Testing branches**:

```
test/e2e-tests
test/integration-tests
test/performance-tests
test/coverage-report
test/acceptance-tests
```

## Branch Workflow

### Creating a New Branch

1. **Start from main**:

   ```bash
   git co main
   git pull origin main
   ```

2. **Create feature branch**:

   ```bash
   git co -b feature/pdf-generation
   ```

3. **Verify branch**:
   ```bash
   git br
   # Should show: feature/pdf-generation
   ```

### Working on a Branch

1. **Make changes**:

   ```bash
   # Edit files
   # Commit frequently
   git ci "feat(pdf-generation): add PDF generation"
   ```

2. **Push to remote**:

   ```bash
   git push -u origin feature/pdf-generation
   ```

3. **Keep branch up-to-date**:
   ```bash
   git co main
   git pull origin main
   git co feature/pdf-generation
   git merge main
   ```

### Merging a Branch

1. **Create pull request**:
   - Go to repository on GitHub/GitLab
   - Click "New Pull Request"
   - Select source: `feature/pdf-generation`
   - Select target: `main`
   - Fill in PR description

2. **Address feedback**:
   - Make changes as needed
   - Commit to feature branch
   - Push to remote

3. **Get approval**:
   - Wait for code review
   - Address any feedback

4. **Merge**:
   - Click "Merge"
   - Confirm merge

5. **Delete branch** (after merge):
   ```bash
   git co main
   git pull origin main
   git br -d feature/pdf-generation
   ```

### Deleting a Branch

1. **Delete local branch**:

   ```bash
   git co main
   git br -d feature/pdf-generation
   ```

2. **Delete remote branch**:
   ```bash
   git push origin --delete feature/pdf-generation
   ```

## Branch Protection

### Main Branch Protection Rules

1. **Require Pull Request**:
   - No direct commits to main
   - All changes must go through PR

2. **Require Status Checks**:
   - Tests must pass
   - Linting must pass
   - Code coverage must meet threshold

3. **Require Approval**:
   - At least one approval required
   - Can be any team member

4. **Require Branch to be Up-to-Date**:
   - Must merge latest main
   - No conflicts allowed

5. **Prevent Force Pushes**:
   - No force pushes allowed
   - Maintains clean history

6. **Require Linear History**:
   - No merge commits in main
   - Use rebase or squashing

### Setting Up Branch Protection

#### GitHub

1. Go to repository settings
2. Click "Branches"
3. Click "Add branch protection rule"
4. Enter `main` as branch name
5. Configure rules:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require approvals (1)
   - ✅ Require branches to be up to date
   - ✅ Do not allow bypassing the above settings
   - ✅ Require linear history
   - ✅ Do not allow force pushes
6. Click "Create"

#### GitLab

1. Go to repository settings
2. Click "Protected branches"
3. Click "Add new protected branch"
4. Enter `main` as branch name
5. Configure rules:
   - ✅ Require approval
   - ✅ Require merge request checks to pass
   - ✅ Require branches to be up to date
6. Click "Add protected branch"

## Branch Lifecycle

### New Feature

```
main (stable)
  ↓
feature/pdf-generation (developing)
  ↓
[Pull Request created]
  ↓
main (stable)
```

### Bug Fix

```
main (stable)
  ↓
bugfix/payment-terms (fixing bug)
  ↓
[Pull Request created]
  ↓
main (stable)
```

### Hotfix

```
main (stable)
  ↓
hotfix/security-patch (critical fix)
  ↓
[Pull Request created]
  ↓
main (stable)
  ↓
develop (if exists)
  ↓
[Release tagged]
```

## Branch Management Best Practices

### Keep Branches Clean

1. **Commit Frequently**:

   ```bash
   # Good: Small, focused commits
   git ci "feat(pdf-generation): add PDF generation"
   git ci "feat(pdf-generation): add print preview"
   git ci "feat(pdf-generation): add download functionality"

   # Bad: Large, mixed commits
   git ci "feat(pdf-generation): add everything"
   ```

2. **Resolve Conflicts Promptly**:

   ```bash
   git co main
   git pull origin main
   git co feature/pdf-generation
   git merge main
   # Resolve conflicts
   git ci "fix: resolve merge conflicts"
   ```

3. **Don't Let Branches Become Stale**:

   ```bash
   # Update feature branch regularly
   git co feature/pdf-generation
   git co main
   git pull origin main
   git co feature/pdf-generation
   git merge main
   ```

4. **Delete Merged Branches**:
   ```bash
   # After merge
   git co main
   git br -d feature/pdf-generation
   git push origin --delete feature/pdf-generation
   ```

### Use Descriptive Branch Names

✅ **Good**:

```
feature/pdf-generation
feature/quotation-to-invoice
bugfix/payment-terms
```

❌ **Bad**:

```
feature/new-feature
feature/f
feature/update
```

### Avoid Long-lived Branches

- Aim for branches to be short-lived (1-2 weeks)
- Create new branches for new features
- Don't keep feature branches for months

### Don't Commit to Wrong Branch

```bash
# Check current branch
git br

# If on main, create feature branch
git co -b feature/pdf-generation

# If on feature branch, continue working
git ci "feat(pdf-generation): add PDF generation"
```

## Common Branch Scenarios

### Scenario 1: Starting a New Feature

```bash
# 1. Start from main
git co main
git pull origin main

# 2. Create feature branch
git co -b feature/pdf-generation

# 3. Verify branch
git br
# feature/pdf-generation

# 4. Make changes
# Edit files...

# 5. Commit frequently
git ci "feat(pdf-generation): add PDF generation"
git ci "feat(pdf-generation): add print preview"

# 6. Push to remote
git push -u origin feature/pdf-generation

# 7. Create pull request
# (In GitHub/GitLab UI)
```

### Scenario 2: Fixing a Bug

```bash
# 1. Start from main
git co main
git pull origin main

# 2. Create bugfix branch
git co -b bugfix/payment-terms

# 3. Make changes
# Edit files...

# 4. Commit
git ci "fix(payment-terms): correct due date calculation"

# 5. Test
npm test

# 6. Push
git push -u origin bugfix/payment-terms

# 7. Create pull request
# (In GitHub/GitLab UI)
```

### Scenario 3: Updating a Feature Branch

```bash
# 1. Update main
git co main
git pull origin main

# 2. Switch to feature branch
git co feature/pdf-generation

# 3. Merge main into feature branch
git merge main

# 4. Resolve conflicts if any
# Edit files...

# 5. Commit merge
git ci "fix: resolve merge conflicts from main"

# 6. Push
git push origin feature/pdf-generation
```

### Scenario 4: Abandoning a Branch

```bash
# 1. Switch to main
git co main

# 2. Delete local branch
git br -d feature/stale-branch

# 3. Delete remote branch
git push origin --delete feature/stale-branch
```

## Branch Statistics

### Track Branch Usage

```bash
# Count branches by type
git br --list 'feature/*' | wc -l
git br --list 'bugfix/*' | wc -l
git br --list 'hotfix/*' | wc -l

# List all branches
git br -a

# Show branch last commit date
git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short) %(committerdate:short)'
```

### Clean Up Stale Branches

```bash
# List branches not merged to main
git br --list --merged main

# List branches not merged to main
git br --list --no-merged main

# Delete merged branches
git br --list --merged main | grep -v 'main' | xargs git br -d

# Delete unmerged branches (use with caution)
git br --list --no-merged main | grep -v 'main' | xargs git br -d
```

## Troubleshooting

### Branch Already Exists

```bash
# Check existing branches
git br

# If you want to start fresh, delete the branch
git co main
git br -d feature/stale-branch
git push origin --delete feature/stale-branch

# Then create new branch
git co -b feature/new-branch
```

### Cannot Push to Remote

```bash
# Check current branch
git br

# If on feature branch, push it
git push -u origin feature/your-branch

# If on main, you may not have permission
# Check with team or use pull request
```

### Merge Conflicts

```bash
# Resolve conflicts
# 1. Edit files marked as conflicted
# 2. Stage resolved files
git add .

# 3. Commit merge
git ci "fix: resolve merge conflicts"
```

## Best Practices Summary

### Creating Branches

- ✅ Start from `main`
- ✅ Use descriptive names
- ✅ Use lowercase with hyphens
- ✅ Be specific and clear

### Working on Branches

- ✅ Commit frequently
- ✅ Keep branch up-to-date with `main`
- ✅ Resolve conflicts promptly
- ✅ Test thoroughly

### Merging Branches

- ✅ Use pull requests
- ✅ Get code review
- ✅ Address feedback
- ✅ Merge cleanly

### Deleting Branches

- ✅ Delete local branches after merge
- ✅ Delete remote branches after merge
- ✅ Don't keep old branches
- ✅ Clean up regularly

## References

- [Git Branching Workflow](https://git-scm.com/book/en/v2/Git-Branching-Workflows)
- [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [Git Best Practices](https://berlin.growthhackers.de/git-best-practices/)
