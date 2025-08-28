# Pull Request

## Description
Brief description of changes made.

**Closes #[issue-number]**

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)

## Testing Checklist ✅

### Unit Tests
- [ ] New unit tests added for all new functions/methods
- [ ] Existing unit tests updated (if needed)
- [ ] All unit tests pass locally
- [ ] Code coverage meets minimum thresholds (80%+)
- [ ] Edge cases and error scenarios tested

### Integration Tests  
- [ ] New integration tests added for API changes
- [ ] Database integration tested
- [ ] Authentication/authorization tested
- [ ] All integration tests pass locally

### E2E Tests (if applicable)
- [ ] WebSocket functionality tested
- [ ] Real-time features validated
- [ ] Multi-user scenarios tested
- [ ] Performance requirements verified

### Security Testing
- [ ] Authentication enforced where required
- [ ] Authorization checks implemented
- [ ] Input validation and sanitization tested
- [ ] Rate limiting verified (if applicable)

### Test Quality
- [ ] Tests are independent and can run in isolation
- [ ] Test data properly cleaned up
- [ ] No test pollution between tests
- [ ] Meaningful test descriptions and assertions

## Code Quality Checklist ✅

- [ ] Code follows existing patterns and conventions
- [ ] TypeScript types properly defined
- [ ] Error handling implemented appropriately
- [ ] Logging added where appropriate
- [ ] No hardcoded values (use configuration)
- [ ] Code is documented where necessary

## CI/CD Pipeline ✅

- [ ] All GitHub Actions checks pass
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] All tests pass (`npm run test:all`)
- [ ] Build succeeds (`npm run build`)
- [ ] Pre-commit hooks pass

## Documentation ✅

- [ ] API documentation updated (if API changes)
- [ ] Feature documentation updated/created
- [ ] README updated (if needed)
- [ ] Database schema changes documented
- [ ] Environment variables documented (if new ones added)

## Database Changes (if applicable)

- [ ] Migration files created
- [ ] Migration tested locally
- [ ] Migration is reversible
- [ ] Seed data updated (if needed)

## Performance Impact

- [ ] No performance degradation introduced
- [ ] New features meet performance requirements
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate

## Security Considerations

- [ ] No sensitive data exposed in logs
- [ ] No hardcoded secrets or keys
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] Rate limiting considered

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Infrastructure requirements documented
- [ ] Feature flags implemented (if needed)
- [ ] Rollback plan considered
- [ ] Monitoring/alerting updated

## Testing Evidence

### Test Coverage
```
# Paste coverage report here
Statements: X% (X/X)
Branches: X% (X/X)  
Functions: X% (X/X)
Lines: X% (X/X)
```

### Performance Benchmarks (if applicable)
```
# Paste performance test results here
Response time: Xms
Throughput: X requests/second
Error rate: X%
```

## Screenshots/Videos (if applicable)
<!-- Add screenshots or videos demonstrating the changes -->

## Review Notes

### What should reviewers focus on?
- 
- 
- 

### Any concerns or areas needing extra attention?
- 
- 

### Testing instructions for reviewers
1. 
2. 
3. 

## Post-Deployment Tasks

- [ ] Monitor application metrics
- [ ] Verify feature functionality in production
- [ ] Update user documentation (if needed)
- [ ] Communicate changes to team

---

## Reviewer Checklist ✅

**For reviewers - please verify:**

- [ ] **Code Quality**: Code follows patterns, is readable, and well-structured
- [ ] **Testing**: Comprehensive test coverage with meaningful assertions
- [ ] **Security**: No security vulnerabilities introduced
- [ ] **Performance**: No performance regressions
- [ ] **Documentation**: Adequate documentation provided

**Testing Verification:**
- [ ] Pulled branch and ran tests locally
- [ ] Verified all tests pass
- [ ] Checked test coverage reports
- [ ] Validated error handling tests

**Before Approval:**
- [ ] All CI/CD checks pass
- [ ] Testing requirements met
- [ ] Documentation complete
- [ ] No outstanding concerns

---

**Note**: PRs without adequate testing will not be approved. Ensure all testing checklist items are completed before requesting review.