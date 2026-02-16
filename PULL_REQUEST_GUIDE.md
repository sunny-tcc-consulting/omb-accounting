# Pull Request Guide

This document describes the pull request process and guidelines for the omb-accounting project.

## Overview

Pull requests (PRs) are used to review and merge code changes into the main branch. All changes to the main branch must go through a pull request process.

## PR Requirements

### Before Creating a PR

- [ ] All tests pass locally
- [ ] Code follows project conventions
- [ ] Commit messages follow conventional format
- [ ] Branch is up-to-date with main
- [ ] No linting errors
- [ ] Documentation updated if needed
- [ ] Code review completed

### PR Checklist

- [ ] Clear and descriptive title
- [ ] Comprehensive description
- [ ] Link to related issues
- [ ] All tests passing
- [ ] Code follows conventions
- [ ] No console errors in browser
- [ ] Responsive design verified
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Approved by reviewer

## PR Title

The PR title should follow the same format as commit messages:

```
<type>(<scope>): <subject>
```

**Examples**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms calculation
refactor(context): improve state management
docs(readme): update installation instructions
```

**Rules**:

- Use conventional commit format
- Be concise and descriptive
- Start with capital letter
- End with period
- Keep under 72 characters

## PR Description

The PR description should provide comprehensive information about the changes.

### Template

```markdown
## Description

[Brief description of the changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Related Issues

Closes #<issue-number>

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

## Breaking Changes

[List any breaking changes here]

## Migration Guide (if applicable)

[Provide migration guide for breaking changes]
```

### Description Guidelines

1. **Be Clear**: Describe what you're changing and why
2. **Be Specific**: Include details about the implementation
3. **Be Complete**: Cover all aspects of the change
4. **Be Concise**: Don't ramble, be direct

**Good Description**:

```markdown
## Description

Add PDF generation functionality to invoices.

This allows users to generate professional PDF invoices
for printing and sharing. Includes customizable templates
and multiple export formats.

## Type of Change

- [x] New feature

## Related Issues

Closes #123

## Test Results

- [x] All tests pass
- [x] No console errors
- [x] Responsive design verified

## Screenshots

![PDF Generation](screenshot.png)
```

**Bad Description**:

```markdown
## Description

Add PDF generation.
```

## PR Review Process

### For Reviewers

1. **Check the PR**:
   - Review the code changes
   - Verify tests pass
   - Check documentation
   - Verify no breaking changes

2. **Provide Feedback**:
   - Be constructive and specific
   - Ask questions if needed
   - Point out issues clearly
   - Suggest improvements

3. **Approve or Request Changes**:
   - Approve if code meets standards
   - Request changes if issues found
   - Explain why changes are needed

### For Contributors

1. **Address Feedback**:
   - Make requested changes
   - Commit to feature branch
   - Push to remote

2. **Update PR**:
   - PR will automatically update
   - Notify reviewer if needed

3. **Final Review**:
   - Ensure all feedback addressed
   - Request final approval

## Approval Requirements

### Minimum Approval

- At least 1 approval required
- Can be any team member

### Approval Criteria

Code is approved when:

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] No security concerns
- [ ] Performance implications considered

## Merging a PR

### Automatic Merging

Some PRs may be automatically merged if:

- All tests pass
- No blocking issues
- Approved by maintainer
- No conflicts with main

### Manual Merging

For complex PRs:

1. Review the code changes
2. Ensure all requirements met
3. Click "Merge" button
4. Confirm merge

### Merge Strategies

**Merge Commit**:

- Creates a merge commit
- Preserves full history
- Good for team collaboration

**Squash and Merge**:

- Squashes all commits into one
- Clean history
- Good for small features

**Rebase and Merge**:

- Rebases commits on top of main
- Linear history
- Good for feature branches

## Common PR Issues

### Issue 1: Tests Failing

**Symptoms**:

- Tests fail in CI
- Tests fail locally

**Solution**:

```bash
# Run tests
npm test

# Fix failing tests
# Commit fixes
git ci "fix: resolve test failures"

# Push
git push origin feature/your-branch
```

### Issue 2: Linting Errors

**Symptoms**:

- Linting fails in CI
- Linting fails locally

**Solution**:

```bash
# Run linter
npm run lint

# Fix linting errors
# Commit fixes
git ci "fix: resolve linting errors"

# Push
git push origin feature/your-branch
```

### Issue 3: Documentation Not Updated

**Symptoms**:

- Documentation outdated
- Missing documentation

**Solution**:

- Update relevant documentation
- Commit to feature branch
- Push to remote

### Issue 4: Breaking Changes

**Symptoms**:

- API changes
- Behavior changes
- Migration required

**Solution**:

- Document breaking changes
- Provide migration guide
- Notify team

## PR Templates

### Pull Request Template

```markdown
## Description

[Brief description of the changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #<issue-number>

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

### Feature Request Template

```markdown
## Feature Request

**Is your feature request related to a problem? Please describe.**
[Describe the problem or need]

**Proposed Solution**
[Describe how you would implement this feature]

**Use Cases**
[Describe specific use cases for this feature]

**Additional Information**
[Any other context or screenshots]
```

### Bug Report Template

```markdown
## Bug Report

**Describe the bug**
[Describe the bug in detail]

**Steps to Reproduce**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**
[What should happen]

**Actual Behavior**
[What actually happens]

**Screenshots**
[Add screenshots if applicable]

**Environment**

- OS: [e.g., Windows, macOS, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]
```

## PR Examples

### Good PR

**Title**:

```
feat(invoice): add PDF generation
```

**Description**:

```markdown
## Description

Add PDF generation functionality to invoices.

This allows users to generate professional PDF invoices
for printing and sharing. Includes customizable templates
and multiple export formats.

## Type of Change

- [x] New feature

## Related Issues

Closes #123

## Checklist

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes

## Test Results

- [x] All tests pass
- [x] No console errors
- [x] Responsive design verified

## Screenshots

![PDF Generation](screenshot.png)
```

### Bad PR

**Title**:

```
update
```

**Description**:

```markdown
## Description

Some changes.
```

## PR Etiquette

### For Contributors

1. **Be Responsive**:
   - Respond to feedback promptly
   - Update PR as needed

2. **Be Collaborative**:
   - Be open to feedback
   - Ask questions if needed
   - Accept constructive criticism

3. **Be Thorough**:
   - Test thoroughly
   - Document well
   - Follow conventions

4. **Be Respectful**:
   - Be polite
   - Be constructive
   - Be professional

### For Reviewers

1. **Be Clear**:
   - Be specific about issues
   - Explain why changes are needed
   - Provide examples

2. **Be Constructive**:
   - Focus on code, not person
   - Suggest improvements
   - Be helpful

3. **Be Timely**:
   - Review promptly
   - Communicate delays

4. **Be Consistent**:
   - Apply same standards to everyone
   - Be fair and impartial

## Tools

### GitHub

1. **Create PR**:
   - Go to repository
   - Click "New Pull Request"
   - Select source and target branches
   - Fill in PR details

2. **Review PR**:
   - Click on PR
   - Review code changes
   - Add comments
   - Approve or request changes

3. **Merge PR**:
   - Click "Merge"
   - Choose merge strategy
   - Confirm merge

### GitLab

1. **Create Merge Request**:
   - Go to repository
   - Click "New Merge Request"
   - Select source and target branches
   - Fill in MR details

2. **Review MR**:
   - Click on MR
   - Review code changes
   - Add comments
   - Approve or request changes

3. **Merge MR**:
   - Click "Merge"
   - Choose merge strategy
   - Confirm merge

## Troubleshooting

### PR Not Showing

**Solution**:

```bash
# Ensure branch is pushed to remote
git push -u origin feature/your-branch

# Check remote branches
git branch -r
```

### PR Not Merging

**Common Issues**:

- Tests failing
- Linting errors
- Conflicts with main
- Review not approved

**Solution**:

```bash
# Update branch with latest main
git co main
git pull origin main
git co feature/your-branch
git merge main

# Fix conflicts
# Commit fixes
git push origin feature/your-branch
```

### Review Not Responding

**Solution**:

- Check if reviewer is notified
- Send a friendly reminder
- Ask in team chat

## Best Practices

### Before Creating PR

- [ ] All tests pass
- [ ] Code follows conventions
- [ ] Commit messages are clear
- [ ] Documentation is updated
- [ ] Code is reviewed by yourself

### During PR Creation

- [ ] Use descriptive title
- [ ] Write comprehensive description
- [ ] Link to related issues
- [ ] Include checklist
- [ ] Add screenshots if applicable

### During PR Review

- [ ] Address feedback promptly
- [ ] Update PR as needed
- [ ] Keep changes focused
- [ ] Don't make unrelated changes

### After PR Merge

- [ ] Delete merged branch
- [ ] Test in main branch
- [ ] Update documentation
- [ ] Close related issues

## References

- [Pull Request Guidelines](https://github.com/github/renovate/blob/main/.github/pull_request_template.md)
- [GitHub Pull Requests](https://docs.github.com/en/pull-requests)
- [GitLab Merge Requests](https://docs.gitlab.com/ee/user/project/merge_requests/)
