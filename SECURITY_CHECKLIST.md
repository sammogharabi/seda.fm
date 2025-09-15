# 🔒 Security Development Checklist

**Use this checklist for all future development to maintain security standards.**

## ✅ Pre-Development Security Checks

- [ ] **No Authentication Bypass**: Never add `skipAuth`, `DEV_SKIP_AUTH`, or similar bypass mechanisms
- [ ] **Environment Separation**: Use proper `.env` files for each environment (qa/sandbox/production)
- [ ] **Secure Secrets**: Generate cryptographically strong secrets using `openssl rand -base64 48`
- [ ] **Real Authentication**: Always use real Supabase auth - never mock/localStorage authentication

## ✅ Code Review Security Checklist

### Authentication & Authorization
- [ ] All protected endpoints use `@UseGuards(AuthGuard)`
- [ ] Admin endpoints use proper `AdminGuard` with timing-safe comparison
- [ ] JWT tokens validated properly with user verification
- [ ] No hardcoded credentials or weak secrets

### Input Validation
- [ ] All DTOs have comprehensive validation (`@IsNotEmpty`, `@MaxLength`, etc.)
- [ ] User input sanitized with `@Transform()` decorators
- [ ] URL inputs validated as HTTPS-only where applicable
- [ ] File uploads restricted and validated

### API Security
- [ ] Rate limiting applied to sensitive endpoints
- [ ] CORS configured for specific origins only
- [ ] Security headers implemented (CSP, HSTS, X-Frame-Options)
- [ ] Error messages don't leak sensitive information

### Database Security
- [ ] Use parameterized queries (Prisma ORM handles this)
- [ ] No raw SQL with user input
- [ ] Proper error handling for database operations
- [ ] Database connection pooling configured

## ✅ Deployment Security Checklist

### Environment Configuration
- [ ] Strong JWT secrets (min 32 characters, cryptographically random)
- [ ] Secure admin API keys (min 32 characters, hex encoded)
- [ ] CORS origins properly configured for environment
- [ ] Database URLs use connection pooling
- [ ] No `.env` files committed to repository

### Infrastructure Security
- [ ] HTTPS enforced for all environments
- [ ] Security headers configured (Helmet middleware)
- [ ] Rate limiting enabled
- [ ] Health checks don't expose sensitive information
- [ ] Logs don't contain secrets or PII

## ✅ Testing Security Checklist

### Authentication Testing
- [ ] Test authentication bypass attempts (should fail)
- [ ] Test with expired/invalid JWT tokens
- [ ] Test admin endpoints with wrong API keys
- [ ] Test rate limiting behavior

### Input Validation Testing
- [ ] Test XSS attempts in all text inputs
- [ ] Test SQL injection attempts
- [ ] Test path traversal attacks
- [ ] Test malformed JSON/data
- [ ] Test overly long inputs

### Integration Testing
- [ ] Test CORS from different origins
- [ ] Test security headers presence
- [ ] Test error handling doesn't leak info
- [ ] Test all endpoints return proper status codes

## 🚨 Security Red Flags - NEVER DO THESE

### ❌ Authentication Anti-Patterns
```typescript
// NEVER: Auth bypass mechanisms
const skipAuth = config.get('SKIP_AUTH');
if (skipAuth) return true;

// NEVER: Mock authentication in production code
const mockUser = { id: 'fake-123' };
localStorage.setItem('user', JSON.stringify(mockUser));

// NEVER: Weak admin authentication
if (adminKey === 'admin123') return true;
```

### ❌ Input Validation Anti-Patterns
```typescript
// NEVER: Raw user input without validation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// NEVER: Unrestricted URL access
await puppeteer.goto(userProvidedUrl); // Could access internal services

// NEVER: No input length limits
@IsString()
comment: string; // Could be 1GB of text
```

### ❌ Error Handling Anti-Patterns
```typescript
// NEVER: Expose internal errors
catch (error) {
  res.json({ error: error.message, stack: error.stack });
}

// NEVER: Database errors exposed to users
throw new Error(`Database query failed: ${dbError.message}`);
```

## ✅ Secure Code Patterns

### Authentication
```typescript
// GOOD: Proper auth guard usage
@UseGuards(AuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get()
  getData(@Request() req: any) {
    const userId = req.user.id; // Validated by AuthGuard
  }
}
```

### Admin Authentication
```typescript
// GOOD: Timing-safe comparison
const providedHash = createHash('sha256').update(adminApiKey).digest();
const expectedHash = createHash('sha256').update(expectedKey).digest();
if (!timingSafeEqual(providedHash, expectedHash)) {
  throw new ForbiddenException('Invalid admin API key');
}
```

### Input Validation
```typescript
// GOOD: Comprehensive validation
@IsNotEmpty({ message: 'URL is required' })
@IsUrl({ protocols: ['https'], require_protocol: true })
@MaxLength(500, { message: 'URL too long' })
@Transform(({ value }) => value?.trim())
targetUrl: string;
```

### Error Handling
```typescript
// GOOD: Secure error responses
catch (error) {
  this.logger.error('Operation failed', error.stack);
  throw new InternalServerErrorException('Operation failed');
}
```

## 📋 Security Review Process

1. **Code Review**: Every PR must pass this security checklist
2. **Automated Testing**: Security tests must pass in CI/CD
3. **Dependency Scanning**: Run `npm audit` before deployment
4. **Penetration Testing**: Test common attack vectors
5. **Documentation**: Update security docs for any new features

## 🔗 Additional Resources

- **Security Audit Report**: `SECURITY_AUDIT_REPORT.md`
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NestJS Security**: https://docs.nestjs.com/security/authentication
- **Prisma Security**: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

---

**Remember**: Security is not optional. Every line of code should be written with security in mind. When in doubt, choose the more secure approach.