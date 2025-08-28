# Development Workflow - Testing First Approach

This document outlines our mandatory testing workflow for all feature development and updates.

## 🚨 IMPORTANT: Testing is NOT Optional

Every feature, bug fix, and update MUST include comprehensive tests. Code without tests will be rejected.

## Development Process

### 1. Feature Planning (Before Coding)

#### Create Feature Issue
Use the feature request template (`.github/ISSUE_TEMPLATE/feature_request.md`) which includes:
- Testing requirements checklist
- Acceptance criteria with test specifications
- Definition of done (testing included)

#### Plan Testing Strategy
Before writing any code, determine:
- What unit tests are needed
- What integration tests are required  
- If E2E tests are necessary
- Performance requirements
- Security considerations

### 2. Development Workflow (TDD Approach)

#### Step 1: Write Tests First
```bash
# Create test file before implementation
touch src/modules/[feature]/[feature].service.spec.ts

# Write failing tests that describe expected behavior
npm run test:watch # Keep running during development
```

#### Step 2: Implement Feature
Write minimal code to make tests pass:
```bash
# Implement service/controller/etc
# Run tests continuously
npm run test:watch
```

#### Step 3: Refactor & Optimize
Improve code while keeping tests green:
```bash
# Ensure all tests still pass after refactoring
npm run test:all
npm run test:cov # Check coverage
```

### 3. Pre-Commit Automation

Our pre-commit hooks automatically run:
- ESLint (code quality)
- TypeScript checking
- Unit tests for changed files
- Coverage threshold validation

```bash
# Install pre-commit hooks (one time)
npx husky install

# This runs automatically on every commit
git commit -m "feat: new feature with tests"
```

### 4. Pull Request Process

#### Before Creating PR
```bash
# Run all tests locally
npm run test:all

# Check coverage
npm run test:cov

# Verify build
npm run build

# Run linting
npm run lint

# Type checking  
npm run typecheck
```

#### PR Requirements
Every PR must:
- [ ] Include comprehensive tests
- [ ] Meet coverage thresholds (80%+)
- [ ] Pass all CI/CD checks
- [ ] Update documentation
- [ ] Follow testing best practices

Use our PR template (`.github/pull_request_template.md`) which enforces testing checklist.

### 5. Code Review Focus

Reviewers must verify:
- [ ] **Test Coverage**: Adequate test coverage for new/changed code
- [ ] **Test Quality**: Tests are meaningful and test behavior, not implementation
- [ ] **Error Handling**: All error scenarios are tested
- [ ] **Edge Cases**: Boundary conditions are covered
- [ ] **Security**: Security-related functionality is tested

## Testing Requirements by Change Type

### New Features
- **Unit Tests**: 85%+ coverage for business logic
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user flows tested
- **Security Tests**: Authentication/authorization tested
- **Performance Tests**: Requirements validated

### Bug Fixes
- **Regression Tests**: Test that reproduces the bug
- **Unit Tests**: Updated for changed logic
- **Integration Tests**: Verify fix works end-to-end
- **Related Tests**: Update any affected tests

### Refactoring
- **Existing Tests**: All existing tests must still pass
- **Test Updates**: Update tests if interface changes
- **Coverage**: Maintain or improve coverage percentage
- **Regression**: Ensure no functionality broken

### Performance Improvements
- **Performance Tests**: Benchmark before/after
- **Load Tests**: Verify under expected load
- **Unit Tests**: Business logic still tested
- **Integration Tests**: E2E performance validated

## Automated Testing Triggers

### On Every Commit (Pre-commit)
- Lint check
- Type checking  
- Unit tests for changed files
- Coverage validation

### On Every Push (CI/CD)
- All unit tests
- All integration tests
- E2E tests (if applicable)
- Security scans
- Performance tests (on main branch)

### On Pull Request
- Full test suite
- Coverage report
- Test quality review
- Performance validation

### On Merge to Main
- Full regression suite
- Deployment tests
- Smoke tests
- Performance benchmarks

## Coverage Requirements

### Minimum Thresholds
```json
{
  "global": {
    "statements": 80,
    "branches": 75,
    "functions": 80,
    "lines": 80
  },
  "modules": {
    "statements": 85,
    "branches": 80,
    "functions": 85,
    "lines": 85
  }
}
```

### Critical Components (90%+ Required)
- Authentication/authorization logic
- Payment processing  
- Data validation
- Security-related functions
- Core business logic

## Quick Commands Reference

### Daily Development
```bash
# Start test-driven development
npm run test:watch

# Run all tests before commit
npm run test:all

# Check coverage
npm run test:cov

# Run only unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Debugging Tests
```bash
# Debug specific test file
npm test -- --testPathPattern="user.service.spec.ts"

# Debug with breakpoints
npm run test:debug

# Run tests for specific feature
npm test -- --testNamePattern="should create user"
```

### Coverage Analysis
```bash
# Generate coverage report
npm run test:cov

# Open coverage report in browser
open coverage/lcov-report/index.html
```

## Testing Documentation Updates

When creating/updating features, also update:

1. **Feature Documentation** (`/docs/features/`)
   - Include testing approach
   - Document test scenarios
   - Explain coverage decisions

2. **API Documentation** (Swagger)
   - Include error response examples
   - Document validation rules
   - Show authentication requirements

3. **README.md** (if public interfaces change)
   - Update testing instructions
   - Include new test commands
   - Document test requirements

## Team Practices

### Code Reviews
- **Testing Focus**: 50% of review time on test quality
- **Coverage Verification**: Check coverage reports
- **Test Execution**: Run tests locally during review
- **Edge Cases**: Verify error scenarios tested

### Definition of Done
A feature is only complete when:
- [ ] All acceptance criteria met
- [ ] Comprehensive tests written and passing
- [ ] Coverage thresholds exceeded
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] CI/CD pipeline passes
- [ ] Performance validated (if applicable)

### Refactoring Safety Net  
Before any refactoring:
1. Ensure comprehensive test coverage exists
2. Run full test suite to establish baseline
3. Refactor incrementally
4. Run tests after each change
5. Maintain or improve test coverage

## Troubleshooting

### Tests Failing in CI but Pass Locally
- Check Node.js versions match
- Verify environment variables
- Look for test interdependencies
- Check database state between tests

### Coverage Thresholds Not Met
- Identify uncovered code: `npm run test:cov`
- Add tests for uncovered branches
- Consider if code is testable (refactor if needed)
- Update thresholds only if justified

### Tests Running Slowly
- Use test parallelization: `--runInBand` only when needed
- Mock external dependencies
- Use test databases appropriately
- Optimize database queries in tests

### Pre-commit Hooks Failing
- Fix linting issues: `npm run lint`
- Update tests for changed code
- Ensure TypeScript compiles: `npm run typecheck`
- Check test coverage: `npm run test:cov`

---

## Remember: Quality First

Testing is not a blocker - it's our safety net. Comprehensive tests:
- Enable confident refactoring
- Prevent regression bugs  
- Document expected behavior
- Improve code design
- Reduce debugging time
- Increase deployment confidence

**Make testing a habit, not a chore. Your future self will thank you.**