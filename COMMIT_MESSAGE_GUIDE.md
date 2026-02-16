# Commit Message Guide

This guide provides detailed examples and best practices for writing effective commit messages in the omb-accounting project.

## Format Overview

All commits must follow the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type Definitions

### feat

New feature or enhancement

**Examples**:

```
feat(invoice): add PDF generation functionality
feat(quotation): add quotation-to-invoice conversion
feat(customer): add customer search and filter
feat(ui): add dark mode support
```

### fix

Bug fix

**Examples**:

```
fix(invoice): correct payment terms calculation
fix(quotation): fix quotation number generation
fix(customer): fix customer deletion bug
fix(ui): fix responsive layout issues
```

### docs

Documentation changes

**Examples**:

```
docs(readme): update installation instructions
docs(git-workflow): add git workflow guide
docs(api): document API endpoints
docs(contributing): add contribution guidelines
```

### style

Code style changes (formatting, no logic changes)

**Examples**:

```
style(code): apply prettier formatting
style(components): align spacing in buttons
style(ui): fix inconsistent padding
```

### refactor

Code refactoring (no behavior change)

**Examples**:

```
refactor(context): improve state management structure
refactor(utils): extract common functions
refactor(components): split large components
refactor(types): improve type definitions
```

### perf

Performance improvements

**Examples**:

```
perf(invoice): optimize PDF generation
perf(invoice): reduce bundle size
perf(context): improve state update performance
perf(ui): optimize render cycles
```

### test

Adding or updating tests

**Examples**:

```
test(invoice): add comprehensive unit tests
test(quotation): add integration tests
test(context): add context tests
test(ui): add component tests
```

### chore

Maintenance tasks (builds, deps, scripts)

**Examples**:

```
chore(deps): update lodash to v4.17.21
chore(deps): upgrade next.js to 16.2.0
chore(build): update build scripts
chore(config): update configuration files
```

### ci

CI/CD changes

**Examples**:

```
ci(github): add automated testing workflow
ci(github): add code coverage reporting
ci(github): add pull request templates
ci(github): add automated deployment
```

### revert

Revert a previous commit

**Examples**:

```
revert: feat(invoice): add PDF generation functionality
revert: fix(quotation): incorrect quotation number
```

## Scope Guidelines

The scope indicates the affected area of the codebase:

### Invoice

- Invoice creation, editing, deletion
- Invoice items and calculations
- Invoice payment status
- Invoice PDF generation
- Invoice listing and filtering

**Examples**:

```
feat(invoice): add PDF generation
fix(invoice): correct payment terms
refactor(invoice): improve invoice context
```

### Quotation

- Quotation creation, editing, deletion
- Quotation items and calculations
- Quotation-to-invoice conversion
- Quotation listing and filtering

**Examples**:

```
feat(quotation): add quotation-to-invoice conversion
fix(quotation): correct quotation number
refactor(quotation): improve quotation context
```

### Customer

- Customer CRUD operations
- Customer search and filtering
- Customer information management
- Customer contact details

**Examples**:

```
feat(customer): add customer search
fix(customer): correct customer deletion
refactor(customer): improve customer context
```

### Context

- Context providers
- State management
- Context consumers
- Context updates

**Examples**:

```
refactor(context): improve state management
fix(context): correct state updates
feat(context): add new context provider
```

### UI

- UI components
- Styling and theming
- Layout and responsiveness
- Accessibility

**Examples**:

```
feat(ui): add dark mode support
fix(ui): fix responsive layout
refactor(ui): improve component structure
```

### Hooks

- React hooks
- Custom hooks
- Hook utilities

**Examples**:

```
feat(hooks): add custom hook for data fetching
refactor(hooks): improve hook performance
fix(hooks): correct hook behavior
```

### Types

- TypeScript types
- Type definitions
- Type interfaces

**Examples**:

```
feat(types): add new type definitions
refactor(types): improve type safety
fix(types): correct type definitions
```

### Utils

- Utility functions
- Helper functions
- Common utilities

**Examples**:

```
refactor(utils): extract common functions
feat(utils): add new utility functions
fix(utils): correct utility behavior
```

## Subject Guidelines

### Imperative Mood

Use the present tense (imperative mood) for the subject:

✅ **Good**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
```

❌ **Bad**:

```
feat(invoice): added PDF generation
fix(quotation): corrected payment terms
feat(invoice): add PDF generation (should be present tense)
```

### Capitalization

Start with a capital letter:

✅ **Good**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
```

❌ **Bad**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
feat(invoice): add PDF generation (lowercase first letter)
```

### Punctuation

End with a period:

✅ **Good**:

```
feat(invoice): add PDF generation.
fix(quotation): correct payment terms.
```

❌ **Bad**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
feat(invoice): add PDF generation (no period)
```

### Length

Keep it under 50 characters:

✅ **Good**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
```

❌ **Bad**:

```
feat(invoice): add comprehensive PDF generation functionality with multiple output formats and customizable templates
fix(quotation): correct the calculation of payment terms for different scenarios including COD and Net terms
```

## Body Guidelines

### Formatting

- Add a blank line after the subject
- Use bullet points for multiple changes
- Keep lines under 72 characters

✅ **Good**:

```
feat(invoice): add PDF generation

- Add PDF generation functionality
- Include print preview
- Support download as PDF
- Use jsPDF and jsPDF-AutoTable
```

❌ **Bad**:

```
feat(invoice): add PDF generation
Add PDF generation functionality
Include print preview
```

### Content

Explain what and why, not how:

✅ **Good**:

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices
for printing and sharing. Includes customizable
templates and multiple export formats.
```

❌ **Bad**:

```
feat(invoice): add PDF generation

Create a new PDF generator component that uses
jsPDF and jsPDF-AutoTable to render invoice data
into PDF format. The component accepts invoice data
as a prop and returns a PDF document.
```

## Footer Guidelines

### Issue References

Use `Closes #<number>` or `Fixes #<number>` to close issues:

✅ **Good**:

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices.

Closes #123
```

❌ **Bad**:

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices.

This closes issue #123 (incorrect format)
```

### Multiple References

Use `Refs #<number>` for references:

✅ **Good**:

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices.

Refs #123
Refs #124
```

### Breaking Changes

Use `BREAKING CHANGE:` to indicate breaking changes:

✅ **Good**:

```
feat(context): refactor state management

BREAKING CHANGE: InvoiceContext API has changed.
Previous methods are now deprecated.

Refs #125
```

## Complete Examples

### Simple Commit

```
feat(invoice): add PDF generation
```

### Multi-line Commit

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices
for printing and sharing. Includes customizable
templates and multiple export formats.

Closes #123
```

### Complex Commit

```
feat(invoice): add PDF generation

Allows users to generate professional PDF invoices
with the following features:
- Multiple export formats (PDF, print)
- Customizable templates
- Print preview functionality
- Download as PDF

Uses jsPDF and jsPDF-AutoTable for professional
formatting. Includes responsive design for all
devices.

Closes #123
Refs #124
```

### Fix with Multi-line Body

```
fix(quotation): correct payment terms calculation

The due date was not being calculated correctly for
COD payment terms. Now properly returns the current
date for COD and correctly adds days for Net terms.

Fixes #125
```

### Refactor with Breaking Change

```
refactor(context): improve state management

BREAKING CHANGE: InvoiceContext API has changed.
- `getInvoices()` renamed to `getAllInvoices()`
- `getInvoiceById()` signature changed
- Added `getFilteredInvoices()` method

This improves separation of concerns and makes
the context more flexible for different use cases.

Refs #126
```

### Chores

```
chore(deps): update lodash to v4.17.21

- Update lodash to v4.17.21
- Fix memory leak in debounce function
- Improve performance of utility functions

Closes #127
```

### Tests

```
test(invoice): add comprehensive unit tests

Add tests for:
- Invoice creation
- Invoice updates
- Invoice deletion
- Invoice calculations
- Invoice validation

Coverage: 85%

Refs #128
```

## Anti-Patterns

### Generic Messages

❌ **Bad**:

```
update
fix
change
improve
```

### Missing Type

❌ **Bad**:

```
(invoice): add PDF generation
feat: add PDF generation
add PDF generation
```

### Missing Scope

❌ **Bad**:

```
feat: add PDF generation
fix: correct payment terms
```

### Wrong Tense

❌ **Bad**:

```
feat(invoice): added PDF generation
fix(quotation): corrected payment terms
```

### Too Long

❌ **Bad**:

```
feat(invoice): add comprehensive PDF generation functionality with multiple output formats, customizable templates, print preview, and download capabilities for professional invoicing
```

### No Period

❌ **Bad**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
```

### Exclamation Marks

❌ **Bad**:

```
feat(invoice): add PDF generation!
fix(quotation): correct payment terms!
```

### Multiple Subjects

❌ **Bad**:

```
feat(invoice): add PDF generation
fix(quotation): correct payment terms
```

## Best Practices Checklist

When writing commit messages:

- [ ] Use conventional commit format
- [ ] Include correct type (feat, fix, docs, etc.)
- [ ] Include appropriate scope (invoice, quotation, etc.)
- [ ] Use imperative mood (present tense)
- [ ] Start with capital letter
- [ ] End with period
- [ ] Keep subject under 50 characters
- [ ] Add body for complex changes
- [ ] Use bullet points for multiple changes
- [ ] Keep body lines under 72 characters
- [ ] Include issue references if applicable
- [ ] Explain what and why, not how
- [ ] Make commit messages meaningful

## Tools

### Commitlint

Automatically validates commit message format:

```bash
npx commitlint --edit .git/COMMIT_EDITMSG
```

### Git Aliases

```bash
git ci "feat(invoice): add PDF generation"
```

### Pre-commit Hook

Automatically runs commitlint before commit:

```bash
npx husky run commit-msg
```

## Troubleshooting

### Commit Message Format Error

If commitlint fails:

1. Check the error message
2. Fix the commit message format
3. Try again

Example:

```
error   commit message should be prefixed with type   feat(invoice): add PDF generation
```

Fix:

```
feat(invoice): add PDF generation
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Git Commit Best Practices](https://git-scm.com/book/en/v2/Distributed-Workflows)
