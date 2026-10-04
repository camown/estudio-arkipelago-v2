'use client';

import React from 'react';
import Link from 'next/link';
import { HRRequest } from '@/types';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface ClearanceLedgerWidgetProps {
  canReviewRequests: boolean;
  isContractor: boolean;
  pendingReviewRequests: HRRequest[];
  myPendingRequests: HRRequest[];
}

export function ClearanceLedgerWidget({
  canReviewRequests,
  isContractor,
  pendingReviewRequests,
  myPendingRequests,
}: ClearanceLedgerWidgetProps) {
  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-border-main bg-surface-hover text-text-main">
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          </div>
          <div>
            <h2 className="text-base font-bold font-sans text-text-main">
              Clearances &amp; Approvals
            </h2>
            <p className="text-xs text-muted-main font-sans">
              Building permits, submittals, and site compliance
            </p>
          </div>
        </div>
        <Link href="/hr" className="text-xs font-semibold text-accent-cyan hover:underline font-mono">
          All Clearances →
        </Link>
      </div>

      {canReviewRequests && pendingReviewRequests.length > 0 ? (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-text-main text-xs">
              <strong>{pendingReviewRequests.length} pending submittal{pendingReviewRequests.length > 1 ? 's' : ''}</strong> awaiting architectural clearance and partner sign-off.
            </span>
          </div>
          <Link
            href="/hr"
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 text-xs shrink-0 transition-colors"
          >
            Review Now
          </Link>
        </div>
      ) : !canReviewRequests && !isContractor && myPendingRequests.length > 0 ? (
        <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-text-main text-xs">
              <strong>Your {myPendingRequests[0].type.replace(/_/g, ' ')} submittal</strong> is currently in partner review.
            </span>
          </div>
          <Link
            href="/hr"
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-xs shrink-0 transition-colors"
          >
            View Status
          </Link>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-border-main/60 bg-surface-hover/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-muted-main text-xs font-mono">
              All architectural and project submittals cleared for today.
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
            CLEAR
          </span>
        </div>
      )}
    </div>
  );
}
