import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface TrustedUploaderBadgeProps {
  isTrusted: boolean;
  stats?: {
    totalUploads: number;
    humanVerifiedPercentage: number;
    reviewsPassed: number;
    consecutiveApprovals?: number;
  };
  variant?: 'inline' | 'full' | 'header';
}

export function TrustedUploaderBadge({ 
  isTrusted, 
  stats,
  variant = 'inline' 
}: TrustedUploaderBadgeProps) {
  
  // Inline badge (for use in post headers, comments, etc.)
  if (variant === 'inline' && isTrusted) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Trusted Uploader
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              Trusted uploaders bypass full AI scans and are randomly audited. 
              Status granted after consistent human-verified uploads.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Header badge (for profile headers)
  if (variant === 'header' && isTrusted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20">
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="w-4 h-4 text-accent-blue" />
                </motion.div>
                <span className="text-sm font-medium text-accent-blue">
                  Trusted Uploader
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-xs">
                Trusted uploaders bypass full AI scans and are randomly audited.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  // Full card (for profile pages with stats)
  if (variant === 'full' && stats) {
    return (
      <Card className={`border-2 ${isTrusted ? 'border-accent-blue/30' : 'border-foreground/10'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${isTrusted ? 'text-accent-blue' : 'text-muted-foreground'}`} />
            Upload Authenticity Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Trusted Status */}
          {isTrusted ? (
            <div className="p-4 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="w-5 h-5 text-accent-blue" />
                </motion.div>
                <span className="font-medium text-accent-blue">Trusted Uploader</span>
                <CheckCircle2 className="w-4 h-4 text-accent-blue ml-auto" />
              </div>
              <p className="text-xs text-accent-blue/80 leading-relaxed">
                Your uploads bypass full AI scans and are processed immediately. 
                Random audits still apply to maintain quality standards.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-secondary/50 border border-foreground/10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Standard Verification</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All uploads undergo AI detection scanning. Build trust through consistent 
                human-verified uploads to unlock Trusted Uploader status.
              </p>
            </div>
          )}

          <Separator />

          {/* Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Verification History</h4>
            
            {/* Human Verified Percentage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Human Verified Rate</span>
                <span className="font-medium text-accent-mint">
                  {stats.humanVerifiedPercentage}%
                </span>
              </div>
              <Progress 
                value={stats.humanVerifiedPercentage} 
                className="h-2 [&>div]:bg-accent-mint"
              />
              {!isTrusted && stats.humanVerifiedPercentage < 100 && (
                <p className="text-[10px] text-muted-foreground">
                  Maintain 100% to qualify for Trusted status
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-2 rounded-lg bg-secondary/50 border border-foreground/10">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-accent-mint" />
                </div>
                <div className="font-medium">{stats.totalUploads}</div>
                <div className="text-[10px] text-muted-foreground">Uploads</div>
              </div>
              
              <div className="text-center p-2 rounded-lg bg-secondary/50 border border-foreground/10">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-4 h-4 text-accent-blue" />
                </div>
                <div className="font-medium">{stats.reviewsPassed}</div>
                <div className="text-[10px] text-muted-foreground">Passed</div>
              </div>
              
              <div className="text-center p-2 rounded-lg bg-secondary/50 border border-foreground/10">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-4 h-4 text-accent-yellow" />
                </div>
                <div className="font-medium">{stats.consecutiveApprovals || 0}</div>
                <div className="text-[10px] text-muted-foreground">Streak</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* How to Earn/Maintain */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {isTrusted ? 'Maintaining Status' : 'Earning Trusted Status'}
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {isTrusted ? (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint flex-shrink-0 mt-0.5" />
                    <span>Continue uploading human-created music</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint flex-shrink-0 mt-0.5" />
                    <span>Pass random authenticity audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint flex-shrink-0 mt-0.5" />
                    <span>Maintain active community standing</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-blue">•</span>
                    <span>Upload 10+ tracks verified as human-created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-blue">•</span>
                    <span>Maintain 100% verification rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-blue">•</span>
                    <span>Active account for 30+ days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-blue">•</span>
                    <span>No policy violations or warnings</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
