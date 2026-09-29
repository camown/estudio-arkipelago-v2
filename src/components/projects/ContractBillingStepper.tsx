'use client';

import React, { useState } from 'react';
import { ContractPhaseStep, ContractPhaseKey } from '@/types';
import { 
  Clock, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractBillingStepperProps {
  projectId?: string;
  projectCode: string;
  projectName?: string;
}

export function ContractBillingStepper({
  projectCode,
}: ContractBillingStepperProps) {
  const [steps, setSteps] = useState<ContractPhaseStep[]>([
    {
      phaseKey: 'PRE_DESIGN',
      phaseLabel: '1. Pre-Design & Mobilization',
      companyContractSent: true,
      companyContractDate: '2026-08-15',
      companyInvoiceSent: true,
      companyInvoiceNumber: 'INV-2024-001',
      clientContractSigned: true,
      clientSignedDate: '2026-08-18',
      clientPaymentReceived: true,
      clientPaymentRef: 'BDO-TRX-99812',
      amount: '$15,000 (10% DP)',
      isUnlocked: true,
    },
    {
      phaseKey: 'SCHEMATIC',
      phaseLabel: '2. Schematic Design Phase',
      companyContractSent: true,
      companyContractDate: '2026-09-01',
      companyInvoiceSent: true,
      companyInvoiceNumber: 'INV-2024-002',
      clientContractSigned: true,
      clientSignedDate: '2026-09-05',
      clientPaymentReceived: true,
      clientPaymentRef: 'BPI-TRX-44219',
      amount: '$30,000 (20%)',
      isUnlocked: true,
    },
    {
      phaseKey: 'DESIGN_DEV',
      phaseLabel: '3. Design Development Phase',
      companyContractSent: true,
      companyContractDate: '2026-09-20',
      companyInvoiceSent: true,
      companyInvoiceNumber: 'INV-2024-003',
      clientContractSigned: true,
      clientSignedDate: '2026-09-22',
      clientPaymentReceived: false,
      amount: '$45,000 (30%)',
      isUnlocked: true,
    },
    {
      phaseKey: 'CONSTRUCTION_DOCS',
      phaseLabel: '4. Construction Drawings / Permitting',
      companyContractSent: false,
      companyInvoiceSent: false,
      clientContractSigned: false,
      clientPaymentReceived: false,
      amount: '$45,000 (30%)',
      isUnlocked: false,
    },
    {
      phaseKey: 'CONSTRUCTION',
      phaseLabel: '5. Construction Administration',
      companyContractSent: false,
      companyInvoiceSent: false,
      clientContractSigned: false,
      clientPaymentReceived: false,
      amount: '$15,000 (10% Retainage)',
      isUnlocked: false,
    },
  ]);

  const handleToggleAction = (
    phaseKey: ContractPhaseKey,
    action: 'companyContractSent' | 'companyInvoiceSent' | 'clientContractSigned' | 'clientPaymentReceived'
  ) => {
    setSteps(prev => prev.map(step => {
      if (step.phaseKey !== phaseKey) return step;
      const updated = { ...step, [action]: !step[action] };
      return updated;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border-main pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            CONTRACTS & BILLING
          </span>
          <span className="text-xs font-mono text-muted-main">{projectCode}</span>
        </div>
        <h3 className="text-sm font-bold text-text-main mt-1">Two-Sided Phase Signoff & Invoice Tracker</h3>
        <p className="text-xs text-muted-main mt-0.5">
          Dual verification: Company issued contracts/billings vs. Client signed agreements & proofs of payment.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.phaseKey}
            className={cn(
              'border rounded-xl p-4 transition-all shadow-2xs',
              step.isUnlocked
                ? 'bg-surface-main border-border-main hover:border-text-main/30'
                : 'bg-surface-hover/30 border-border-main/50 opacity-60'
            )}
          >
            {/* Step Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-3">
              <div className="flex items-center gap-2">
                {step.clientPaymentReceived ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : step.isUnlocked ? (
                  <Clock className="w-4 h-4 text-amber-500" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-main" />
                )}
                <h4 className="text-xs font-bold text-text-main">{step.phaseLabel}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-hover border border-border-main text-text-main">
                  {step.amount}
                </span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                    step.clientPaymentReceived
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : step.companyInvoiceSent
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                  )}
                >
                  {step.clientPaymentReceived ? 'PAID & UNLOCKED' : step.companyInvoiceSent ? 'INVOICED - PENDING' : 'NOT STARTED'}
                </span>
              </div>
            </div>

            {/* Two-Sided Matrix (Company vs Client) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {/* Left Column: Estudio Arkipelago Side */}
              <div className="bg-surface-hover/40 p-3 rounded-lg border border-border-main/40 space-y-2">
                <span className="text-[10px] font-bold text-muted-main uppercase font-mono tracking-wider block">
                  Studio Deliverables & Billing:
                </span>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-main">Phase Contract Issued:</span>
                  <button
                    onClick={() => handleToggleAction(step.phaseKey, 'companyContractSent')}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer',
                      step.companyContractSent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-hover text-muted-main border border-border-main'
                    )}
                  >
                    {step.companyContractSent ? '✓ Sent' : 'Mark Sent'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-main">Billing Statement / Invoice:</span>
                  <button
                    onClick={() => handleToggleAction(step.phaseKey, 'companyInvoiceSent')}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer',
                      step.companyInvoiceSent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-hover text-muted-main border border-border-main'
                    )}
                  >
                    {step.companyInvoiceSent ? (step.companyInvoiceNumber || '✓ Invoiced') : 'Issue Invoice'}
                  </button>
                </div>
              </div>

              {/* Right Column: Client Side */}
              <div className="bg-surface-hover/40 p-3 rounded-lg border border-border-main/40 space-y-2">
                <span className="text-[10px] font-bold text-muted-main uppercase font-mono tracking-wider block">
                  Client Verification & Payment:
                </span>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-main">Signed Agreement:</span>
                  <button
                    onClick={() => handleToggleAction(step.phaseKey, 'clientContractSigned')}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer',
                      step.clientContractSigned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-surface-hover text-muted-main border border-border-main'
                    )}
                  >
                    {step.clientContractSigned ? '✓ Received' : 'Awaiting'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-main">Proof of Payment:</span>
                  <button
                    onClick={() => handleToggleAction(step.phaseKey, 'clientPaymentReceived')}
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer',
                      step.clientPaymentReceived
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    )}
                  >
                    {step.clientPaymentReceived ? (step.clientPaymentRef || '✓ Confirmed') : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
