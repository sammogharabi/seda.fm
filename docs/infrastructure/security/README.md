# Security Infrastructure - seda.fm

## 🔒 Overview

seda.fm implements comprehensive security measures to protect user data, prevent unauthorized access, and ensure platform integrity. The security architecture follows industry best practices and compliance standards.

## 🛡️ Security Architecture

### **Defense in Depth Strategy**
```
┌─────────────────────────────────────────────────────────┐
│                   External Security                     │
│  CDN / WAF / DDoS Protection / Rate Limiting           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Application Security                       │
│  Authentication / Authorization / Input Validation     │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│               Data Security                             │
│  Encryption / Data Masking / Secure Storage           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│            Infrastructure Security                      │
│  Network Security / Container Security / Secrets       │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

### **JWT Token Management**
```typescript
// src/common/auth/jwt.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID for revocation
}

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

  async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: Omit<JwtPayload, 'iat' | 'exp' | 'jti'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jti = this.generateJti();
    const accessTokenExpiry = 15 * 60; // 15 minutes
    const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days

    const accessToken = jwt.sign(
      { ...payload, jti },
      this.configService.get('security.jwtSecret'),
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
      { ...payload, jti, type: 'refresh' },
      this.configService.get('security.jwtSecret'),
      { expiresIn: refreshTokenExpiry }
    );

    // Store refresh token hash for validation
    await this.storeRefreshToken(user.id, jti, refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
    };
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.verify(
        token,
        this.configService.get('security.jwtSecret')
      ) as JwtPayload;

      // Check if token is revoked
      if (await this.isTokenRevoked(decoded.jti)) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } | null> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.configService.get('security.jwtSecret')
      ) as JwtPayload & { type: string };

      if (decoded.type !== 'refresh') {
        return null;
      }

      // Validate refresh token exists and is not revoked
      if (!(await this.validateRefreshToken(decoded.sub, decoded.jti))) {
        return null;
      }

      // Revoke old tokens
      await this.revokeToken(decoded.jti);

      // Get fresh user data
      const user = await this.getUserById(decoded.sub);
      if (!user) return null;

      return this.generateTokens(user);
    } catch (error) {
      return null;
    }
  }

  async revokeToken(jti: string): Promise<void> {
    // Store revoked tokens with expiration
    await this.storeRevokedToken(jti);
  }

  private generateJti(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeRefreshToken(userId: string, jti: string, expirySeconds: number): Promise<void> {
    // Implementation would store in Redis or database with TTL
  }

  private async validateRefreshToken(userId: string, jti: string): Promise<boolean> {
    // Check if refresh token exists and is valid
    return true; // Placeholder
  }

  private async isTokenRevoked(jti: string): Promise<boolean> {
    // Check against revocation list
    return false; // Placeholder
  }

  private async storeRevokedToken(jti: string): Promise<void> {
    // Store in revocation list with expiration
  }

  private async getUserById(userId: string): Promise<any> {
    // Fetch user from database
    return null; // Placeholder
  }
}
```

### **Role-Based Access Control (RBAC)**
```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage in controllers
@Post('admin-action')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(AuthGuard, RolesGuard)
async performAdminAction() {
  // Only admins can access this endpoint
}
```

### **Multi-Factor Authentication (MFA)**
```typescript
// src/modules/auth/mfa.service.ts
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { QRCode } from 'qrcode';

@Injectable()
export class MfaService {
  async generateSecret(userEmail: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    const secret = authenticator.generateSecret();
    const serviceName = 'seda.fm';
    
    const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  validateToken(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  validateBackupCode(userBackupCodes: string[], code: string): boolean {
    const hashedCode = this.hashBackupCode(code);
    return userBackupCodes.includes(hashedCode);
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(this.hashBackupCode(code));
    }
    return codes;
  }

  private hashBackupCode(code: string): string {
    // Hash backup codes for secure storage
    return bcrypt.hashSync(code, 10);
  }
}
```

## 🛡️ Input Validation & Sanitization

### **Comprehensive Validation Pipeline**
```typescript
// src/common/pipes/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform and sanitize input
    const sanitizedValue = this.sanitizeInput(value);
    const object = plainToClass(metatype, sanitizedValue);
    
    // Validate
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      // Sanitize HTML content
      const window = new JSDOM('').window;
      const purify = DOMPurify(window);
      
      return purify.sanitize(value, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [],
      });
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeInput(val);
      }
      return sanitized;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }

    return value;
  }
}
```

### **SQL Injection Prevention**
```typescript
// Using Prisma ORM provides built-in SQL injection protection
// Additional raw query safety
async safeRawQuery(query: string, params: any[]) {
  // Validate that raw queries only come from trusted sources
  if (!this.isQuerySafe(query)) {
    throw new Error('Unsafe raw query detected');
  }

  return this.prisma.$queryRaw(query, ...params);
}

private isQuerySafe(query: string): boolean {
  // Check for dangerous patterns
  const dangerousPatterns = [
    /;\s*(drop|delete|update|insert|create|alter)/i,
    /union\s+select/i,
    /exec\s*\(/i,
    /script\s*>/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(query));
}
```

## 🔐 Data Encryption

### **Encryption Service**
```typescript
// src/common/encryption/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor(private readonly encryptionKey: string) {}

  // Encrypt sensitive data (PII, tokens, etc.)
  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('seda.fm', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('seda.fm', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash passwords
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive identifiers
  hashIdentifier(identifier: string): string {
    return crypto.createHash('sha256')
      .update(identifier + this.encryptionKey)
      .digest('hex');
  }
}
```

### **Data Classification & Protection**
```typescript
// src/common/decorators/sensitive-data.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SENSITIVE_DATA_KEY = 'sensitiveData';
export const SensitiveData = (level: 'PII' | 'CONFIDENTIAL' | 'RESTRICTED') =>
  SetMetadata(SENSITIVE_DATA_KEY, level);

// Interceptor to handle sensitive data
@Injectable()
export class DataProtectionInterceptor implements NestInterceptor {
  constructor(private encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.protectSensitiveData(data, context))
    );
  }

  private protectSensitiveData(data: any, context: ExecutionContext): any {
    const sensitiveLevel = this.reflector.get<string>(
      SENSITIVE_DATA_KEY,
      context.getHandler()
    );

    if (!sensitiveLevel || !data) return data;

    // Apply data masking/redaction based on user role
    const user = context.switchToHttp().getRequest().user;
    
    return this.maskSensitiveFields(data, sensitiveLevel, user?.role);
  }

  private maskSensitiveFields(data: any, level: string, userRole: string): any {
    // Implementation of field masking based on classification
    if (level === 'PII' && userRole !== 'ADMIN') {
      // Mask PII for non-admin users
      return this.maskPII(data);
    }
    
    return data;
  }
}
```

## 🛡️ Rate Limiting & DDoS Protection

### **Advanced Rate Limiting**
```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as Redis from 'redis';

export interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Duration in seconds
  blockDuration?: number; // Block duration in seconds
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis.RedisClientType;

  constructor(private reflector: Reflector) {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      'rateLimit',
      context.getHandler()
    );

    if (!rateLimitOptions) return true;

    const request = context.switchToHttp().getRequest();
    const key = this.getRateLimitKey(request, rateLimitOptions);
    
    const current = await this.redis.get(key);
    const currentCount = current ? parseInt(current) : 0;

    if (currentCount >= rateLimitOptions.points) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          retryAfter: rateLimitOptions.blockDuration || rateLimitOptions.duration,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment counter
    await this.redis.incr(key);
    
    // Set expiration on first request
    if (currentCount === 0) {
      await this.redis.expire(key, rateLimitOptions.duration);
    }

    return true;
  }

  private getRateLimitKey(request: any, options: RateLimitOptions): string {
    // Use different strategies based on endpoint
    const ip = request.ip;
    const userId = request.user?.id;
    const endpoint = request.route?.path || request.url;

    // Combine user and IP for better protection
    return `rate_limit:${endpoint}:${userId || ip}:${options.duration}`;
  }
}

// Usage
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata('rateLimit', options);

@Post('send-message')
@RateLimit({ points: 10, duration: 60 }) // 10 messages per minute
async sendMessage(@Body() data: SendMessageDto) {
  // Implementation
}
```

### **DDoS Protection Strategies**
```typescript
// src/common/middleware/ddos-protection.middleware.ts
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DDoSProtectionMiddleware implements NestMiddleware {
  private suspiciousIPs = new Map<string, {
    count: number;
    firstRequest: number;
    blocked: boolean;
    blockExpiry: number;
  }>();

  private readonly thresholds = {
    requests: 100, // Max requests per minute
    timeWindow: 60000, // 1 minute
    blockDuration: 300000, // 5 minutes
  };

  use(req: Request, res: Response, next: NextFunction) {
    const clientIP = this.getClientIP(req);
    const now = Date.now();

    // Clean up old entries
    this.cleanupOldEntries(now);

    let ipData = this.suspiciousIPs.get(clientIP);

    if (!ipData) {
      ipData = {
        count: 0,
        firstRequest: now,
        blocked: false,
        blockExpiry: 0,
      };
      this.suspiciousIPs.set(clientIP, ipData);
    }

    // Check if IP is currently blocked
    if (ipData.blocked && now < ipData.blockExpiry) {
      throw new HttpException(
        'IP temporarily blocked due to suspicious activity',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Reset counter if time window has passed
    if (now - ipData.firstRequest > this.thresholds.timeWindow) {
      ipData.count = 0;
      ipData.firstRequest = now;
      ipData.blocked = false;
    }

    ipData.count++;

    // Block if threshold exceeded
    if (ipData.count > this.thresholds.requests) {
      ipData.blocked = true;
      ipData.blockExpiry = now + this.thresholds.blockDuration;
      
      // Log suspicious activity
      console.warn(`Blocking IP ${clientIP} for ${this.thresholds.blockDuration}ms`);
      
      throw new HttpException(
        'Too many requests - IP blocked',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }

  private getClientIP(req: Request): string {
    return req.headers['x-forwarded-for'] as string ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  private cleanupOldEntries(now: number) {
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.firstRequest > this.thresholds.timeWindow && 
          (!data.blocked || now > data.blockExpiry)) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
}
```

## 🔐 Secrets Management

### **Environment-based Secrets**
```typescript
// src/config/secrets.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SecretsService {
  private secretsManager: AWS.SecretsManager;

  constructor() {
    this.secretsManager = new AWS.SecretsManager({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async getSecret(secretId: string): Promise<string> {
    try {
      // In development, use environment variables
      if (process.env.NODE_ENV === 'development') {
        return process.env[secretId] || '';
      }

      // In production, use AWS Secrets Manager or similar
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretId,
      }).promise();

      return result.SecretString || '';
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretId}:`, error);
      return '';
    }
  }

  async getDatabaseCredentials(): Promise<{
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
  }> {
    const secretString = await this.getSecret('seda-fm/database');
    return JSON.parse(secretString);
  }

  async getSupabaseCredentials(): Promise<{
    url: string;
    anonKey: string;
    serviceKey: string;
  }> {
    const secretString = await this.getSecret('seda-fm/supabase');
    return JSON.parse(secretString);
  }
}
```

## 🚨 Security Monitoring

### **Security Event Logging**
```typescript
// src/common/security/security-logger.service.ts
import { Injectable } from '@nestjs/common';

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  timestamp: Date;
}

@Injectable()
export class SecurityLoggerService {
  async logSecurityEvent(event: SecurityEvent) {
    // Log to secure audit trail
    console.log('SECURITY_EVENT:', JSON.stringify(event));
    
    // Send to SIEM system
    await this.sendToSIEM(event);
    
    // Trigger alerts for high/critical events
    if (['HIGH', 'CRITICAL'].includes(event.severity)) {
      await this.triggerSecurityAlert(event);
    }
  }

  async logAuthFailure(ip: string, userAgent: string, attemptedEmail?: string) {
    await this.logSecurityEvent({
      type: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      ip,
      userAgent,
      details: { attemptedEmail },
      timestamp: new Date(),
    });
  }

  async logSuspiciousActivity(userId: string, ip: string, userAgent: string, activity: string) {
    await this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'HIGH',
      userId,
      ip,
      userAgent,
      details: { activity },
      timestamp: new Date(),
    });
  }

  private async sendToSIEM(event: SecurityEvent) {
    // Send to external SIEM system (Splunk, ELK, etc.)
  }

  private async triggerSecurityAlert(event: SecurityEvent) {
    // Send immediate alerts to security team
  }
}
```

### **Anomaly Detection**
```typescript
// src/common/security/anomaly-detection.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnomalyDetectionService {
  async detectLoginAnomalies(userId: string, ip: string, userAgent: string): Promise<boolean> {
    // Check for unusual login patterns
    const userHistory = await this.getUserLoginHistory(userId);
    
    const anomalies = [
      await this.checkGeographicalAnomaly(userId, ip, userHistory),
      await this.checkTimeAnomaly(userId, userHistory),
      await this.checkDeviceAnomaly(userId, userAgent, userHistory),
      await this.checkFrequencyAnomaly(userId, userHistory),
    ];

    return anomalies.some(anomaly => anomaly);
  }

  private async checkGeographicalAnomaly(userId: string, ip: string, history: any[]): Promise<boolean> {
    // Check if login is from unusual geographical location
    const location = await this.getLocationFromIP(ip);
    const recentLocations = history.slice(0, 10).map(h => h.location);
    
    // Flag if location is more than 1000km from recent locations
    return !recentLocations.some(loc => 
      this.calculateDistance(location, loc) < 1000
    );
  }

  private async checkTimeAnomaly(userId: string, history: any[]): Promise<boolean> {
    // Check if login is at unusual time for user
    const currentHour = new Date().getHours();
    const userTypicalHours = this.getUserTypicalLoginHours(history);
    
    return !userTypicalHours.includes(currentHour);
  }

  private async checkDeviceAnomaly(userId: string, userAgent: string, history: any[]): Promise<boolean> {
    // Check if device/browser is new for user
    const deviceFingerprint = this.generateDeviceFingerprint(userAgent);
    const knownDevices = history.map(h => h.deviceFingerprint);
    
    return !knownDevices.includes(deviceFingerprint);
  }

  // Additional helper methods...
  private async getUserLoginHistory(userId: string): Promise<any[]> {
    // Fetch user login history from database
    return [];
  }

  private async getLocationFromIP(ip: string): Promise<{ lat: number; lng: number }> {
    // Get geographical location from IP
    return { lat: 0, lng: 0 };
  }
}
```

## 🔒 Compliance & Data Protection

### **GDPR Compliance**
```typescript
// src/modules/privacy/privacy.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrivacyService {
  async exportUserData(userId: string): Promise<any> {
    // Export all user data in machine-readable format
    const userData = {
      profile: await this.getUserProfile(userId),
      messages: await this.getUserMessages(userId),
      artistData: await this.getArtistData(userId),
      preferences: await this.getUserPreferences(userId),
    };

    // Anonymize sensitive data
    return this.anonymizeSensitiveData(userData);
  }

  async deleteUserData(userId: string): Promise<void> {
    // Implement right to be forgotten
    await this.anonymizeUserData(userId);
    await this.updateDataRetentionLogs(userId);
  }

  async anonymizeUserData(userId: string): Promise<void> {
    // Replace PII with anonymized versions
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${Date.now()}@example.com`,
        // Keep other data for analytics but anonymized
      },
    });

    // Anonymize messages but keep content for community
    await this.prisma.message.updateMany({
      where: { userId },
      data: {
        // Replace with anonymized user reference
      },
    });
  }

  async trackDataAccess(userId: string, dataType: string, accessor: string) {
    // Log data access for audit trail
    await this.prisma.dataAccessLog.create({
      data: {
        userId,
        dataType,
        accessedBy: accessor,
        accessedAt: new Date(),
      },
    });
  }
}
```

This comprehensive security infrastructure ensures seda.fm maintains the highest standards of security, privacy, and compliance while providing a seamless user experience.