'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Briefcase, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Send,
  Info
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export type HRRequestType = 
  | 'overtime'
  | 'leave'
  | 'schedule_adjustment'
  | 'official_business'
  | 'certificate'
  | 'reimbursement'
  | 'hours_adjustment'
  | 'complaint';

export interface HRRequest {
  id: string;
  type: HRRequestType;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  details: Record<string, unknown>;
  userId?: string;
  userName?: string;
  createdAt: string;
}

const HR_REQUEST_TYPES = [
  { id: 'overtime' as HRRequestType, label: 'OVERTIME', icon: Clock },
  { id: 'leave' as HRRequestType, label: 'LEAVE', icon: Calendar },
  { id: 'schedule_adjustment' as HRRequestType, label: 'SCHEDULE ADJUSTMENT', icon: Clock },
  { id: 'official_business' as HRRequestType, label: 'OFFICIAL BUSINESS', icon: Briefcase },
  { id: 'certificate' as HRRequestType, label: 'CERTIFICATE OF ATTENDANCE', icon: FileText },
  { id: 'reimbursement' as HRRequestType, label: 'REIMBURSEMENT', icon: DollarSign },
  { id: 'hours_adjustment' as HRRequestType, label: 'PROJECT HOURS ADJUSTMENT', icon: Clock },
  { id: 'complaint' as HRRequestType, label: 'SUBMIT COMPLAINT', icon: AlertTriangle, destructive: true },
];

function getInitialTodayDate() {
  if (typeof window === 'undefined') return '';
  return new Date().toISOString().split('T')[0];
}

function getInitialHRRequests(): HRRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('arkipelago_hr_requests');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse HR requests', e);
  }
  return [];
}

export default function HRPage() {
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState<HRRequestType>('overtime');
  const [reason, setReason] = useState('');
  
  const [todayStr] = useState(getInitialTodayDate);

  // Form states
  const [otDate, setOtDate] = useState(todayStr);
  const [otIn, setOtIn] = useState('09:00');
  const [otOut, setOtOut] = useState('18:00');
  
  const [leaveType, setLeaveType] = useState('Vacation');
  const [leaveFrom, setLeaveFrom] = useState(todayStr);
  const [leaveTo, setLeaveTo] = useState(todayStr);
  
  const [reimburseAmount, setReimburseAmount] = useState('');
  const [reimburseDate, setReimburseDate] = useState(todayStr);
  const [reimburseDesc, setReimburseDesc] = useState('');
  
  const [complaintCategory, setComplaintCategory] = useState('Workplace Issue');
  const [complaintDesc, setComplaintDesc] = useState('');
  
  const [genericDate, setGenericDate] = useState(todayStr);

  const [requests, setRequests] = useState<HRRequest[]>(getInitialHRRequests);
  const [successMsg, setSuccessMsg] = useState('');

  const calculateOvertime = () => {
    const [inH, inM] = otIn.split(':').map(Number);
    const [outH, outM] = otOut.split(':').map(Number);
    const inTotal = inH + inM / 60;
    const outTotal = outH + outM / 60;
    const diff = outTotal - inTotal;
    if (diff > 9) {
      return (diff - 9).toFixed(1);
    }
    return '0.0';
  };

  const handleSubmit = () => {
    if (!reason && selectedType !== 'complaint' && selectedType !== 'reimbursement') {
      alert('Clear reason is required.');
      return;
    }

    let details: Record<string, unknown> = {};

    switch (selectedType) {
      case 'overtime':
        details = { date: otDate, clockIn: otIn, clockOut: otOut, computedHours: calculateOvertime() };
        break;
      case 'leave':
        details = { leaveType, dateFrom: leaveFrom, dateTo: leaveTo };
        break;
      case 'reimbursement':
        details = { amount: reimburseAmount, date: reimburseDate, description: reimburseDesc };
        break;
      case 'complaint':
        details = { category: complaintCategory, description: complaintDesc };
        break;
      default:
        details = { date: genericDate };
    }

    const newReq: HRRequest = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hr-${Date.now()}`,
      type: selectedType,
      date: new Date().toISOString(),
      status: 'pending',
      reason: reason || (selectedType === 'complaint' ? complaintDesc : reimburseDesc),
      details,
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest User',
      createdAt: new Date().toISOString(),
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    localStorage.setItem('arkipelago_hr_requests', JSON.stringify(updated));

    setReason('');
    setComplaintDesc('');
    setReimburseDesc('');
    setSuccessMsg('REQUEST SUBMITTED SUCCESSFULLY');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getFormTitle = () => {
    const typeDef = HR_REQUEST_TYPES.find(t => t.id === selectedType);
    return `${typeDef?.label} DETAILED PARAMETERS`;
  };

  const activeTypeDef = HR_REQUEST_TYPES.find(t => t.id === selectedType);

  const isPartner = user?.role === 'partner';

  const handleApprove = (reqId: string) => {
    if (!isPartner) {
      alert('ONLY PARTNERS CAN APPROVE HR REQUESTS.');
      return;
    }
    const updated = requests.map((r) => (r.id === reqId ? { ...r, status: 'approved' as const } : r));
    setRequests(updated);
    localStorage.setItem('arkipelago_hr_requests', JSON.stringify(updated));
  };

  const handleReject = (reqId: string) => {
    if (!isPartner) {
      alert('ONLY PARTNERS CAN REJECT HR REQUESTS.');
      return;
    }
    const updated = requests.map((r) => (r.id === reqId ? { ...r, status: 'rejected' as const } : r));
    setRequests(updated);
    localStorage.setItem('arkipelago_hr_requests', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-mono transition-colors pb-12">
      {/* Header */}
      <header className="flex justify-between items-start mb-8 border-b border-border-main pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest mb-2">HUMAN RESOURCES (HR)</h1>
          <p className="text-accent-cyan text-xs font-semibold tracking-widest">
            FILE PROFESSIONAL WORKPLACE REQUESTS, TRACK ATTENDANCE LEDGERS, AND MANAGE SCHEDULES SECURELY.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-3 py-1 font-bold rounded uppercase tracking-wider border ${
            isPartner ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' : 'bg-surface-hover text-muted-main border-border-main'
          }`}>
            ROLE: {user?.role ? user.role.replace('_', ' ') : 'JUNIOR ARCHITECT'}
          </span>
          <button className="border-2 border-border-strong px-4 py-1.5 text-xs font-bold uppercase hover:bg-surface-hover transition-colors rounded-lg">
            REQUESTS
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: FILE REQUEST FORM */}
        <div className="lg:w-[60%] flex flex-col gap-6">
          
          {/* SECTION 1: Type Selection */}
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase mb-1 tracking-wider">SELECT REQUEST FLOW TO FILE</h2>
            <p className="text-muted-main text-xs uppercase mb-4 tracking-wide">
              CLICK A BUTTON BELOW TO ACTIVATE AND FILL OUT PARAMETERS. CLEAR REASON REQUIRED FOR ALL.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {HR_REQUEST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                let btnClass = "border rounded-lg py-3.5 px-3 flex flex-col items-center justify-center gap-2 text-[11px] font-bold uppercase transition-all ";
                
                if (type.destructive) {
                  if (isSelected) {
                    btnClass += "bg-accent-red/10 border-accent-red text-accent-red font-extrabold shadow-sm";
                  } else {
                    btnClass += "bg-transparent border-accent-red/60 text-accent-red hover:bg-accent-red/10";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "bg-black text-white dark:bg-white dark:text-black border-text-main shadow-sm font-extrabold";
                  } else {
                    btnClass += "bg-surface-hover/50 border-border-main text-muted-main hover:border-border-strong hover:text-text-main";
                  }
                }

                return (
                  <button 
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={btnClass}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-center leading-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: Dynamic Form */}
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-border-main pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">{getFormTitle()}</h3>
              <span className="text-[10px] bg-surface-hover px-2.5 py-1 text-text-main tracking-widest uppercase font-bold rounded">
                PARAMS
              </span>
            </div>

            <div className="space-y-6">
              {selectedType === 'overtime' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-main uppercase font-bold">CALENDAR DATE</label>
                      <input 
                        type="date" 
                        value={otDate}
                        onChange={(e) => setOtDate(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-main uppercase font-bold">ACTUAL CLOCK-IN</label>
                      <input 
                        type="time" 
                        value={otIn}
                        onChange={(e) => setOtIn(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-muted-main uppercase font-bold">ACTUAL CLOCK-OUT</label>
                      <input 
                        type="time" 
                        value={otOut}
                        onChange={(e) => setOtOut(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                  </div>
                  <div className="bg-surface-hover/80 p-4 rounded-lg border border-border-main flex items-start gap-3">
                    <Info className="text-accent-cyan w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase text-text-main mb-1 flex items-center gap-2">
                        CALCULATED OVERTIME COMPENSATION:
                        <span className="text-accent-cyan font-mono text-sm font-extrabold">{calculateOvertime()} Hrs</span>
                      </p>
                      <p className="text-[10px] text-muted-main uppercase">
                        (CLOCK-IN + 9 WORKING HOURS) - CLOCK-OUT THRESHOLD
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'leave' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-main uppercase font-bold">LEAVE TYPE</label>
                    <select 
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono focus:outline-none text-text-main rounded-lg"
                    >
                      <option value="Vacation">VACATION LEAVE</option>
                      <option value="Sick">SICK LEAVE</option>
                      <option value="Personal">PERSONAL LEAVE</option>
                      <option value="Emergency">EMERGENCY LEAVE</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-main uppercase font-bold">DATE FROM</label>
                    <input 
                      type="date" 
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-main uppercase font-bold">DATE TO</label>
                    <input 
                      type="date" 
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {selectedType === 'reimbursement' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-main uppercase font-bold">AMOUNT ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={reimburseAmount}
                      onChange={(e) => setReimburseAmount(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-muted-main uppercase font-bold">EXPENSE DATE</label>
                    <input 
                      type="date" 
                      value={reimburseDate}
                      onChange={(e) => setReimburseDate(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {selectedType === 'complaint' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-accent-red uppercase font-bold">COMPLAINT CATEGORY</label>
                    <select 
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="bg-surface-hover border border-accent-red/50 px-3 py-2.5 text-xs font-mono text-text-main rounded-lg"
                    >
                      <option value="Workplace Issue">WORKPLACE ISSUE</option>
                      <option value="Harassment">HARASSMENT / MISCONDUCT</option>
                      <option value="Payroll Dispute">PAYROLL DISPUTE</option>
                      <option value="Safety Hazard">SAFETY HAZARD</option>
                    </select>
                  </div>
                  <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-xs">
                    <p className="font-bold uppercase">CONFIDENTIAL SUBMISSION</p>
                    <p className="text-[10px] opacity-90 uppercase mt-0.5">THIS COMPLAINT WILL BE SENT DIRECTLY TO THE PARTNER MANAGEMENT TEAM FOR PRIVACY.</p>
                  </div>
                </div>
              )}

              {['schedule_adjustment', 'official_business', 'certificate', 'hours_adjustment'].includes(selectedType) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-main uppercase font-bold">EFFECTIVE DATE</label>
                  <input 
                    type="date" 
                    value={genericDate}
                    onChange={(e) => setGenericDate(e.target.value)}
                    className="bg-surface-hover border border-border-main px-3 py-2.5 text-xs font-mono text-text-main rounded-lg max-w-xs" 
                  />
                </div>
              )}

              {/* Reason Field */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[10px] text-muted-main uppercase font-bold">REASON FOR HR REQUEST *</label>
                <textarea 
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the clear reason and business context to assist the management verification flow..."
                  className="bg-surface-hover border border-border-main p-3 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg placeholder:text-muted-main/60"
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase text-center">
                  {successMsg}
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className={`w-full py-3 px-6 rounded-lg uppercase font-bold text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                  activeTypeDef?.destructive
                    ? 'bg-accent-red text-white hover:opacity-90'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-md'
                }`}
              >
                <Send className="w-4 h-4" />
                SUBMIT HR {activeTypeDef?.label} REQUEST
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: REQUESTS LEDGER */}
        <div className="lg:w-[40%]">
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm h-full flex flex-col">
            <div className="border-b border-border-main pb-4 mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-text-main mb-1">REQUESTS LEDGER & CLEARANCES</h2>
                <p className="text-muted-main text-[11px] uppercase tracking-wide">
                  LISTING REGISTERED SUBMITTALS & CLEARANCES.
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {requests.length === 0 ? (
                <div className="border border-dashed border-border-strong rounded-xl p-8 text-center bg-surface-hover/30">
                  <p className="text-muted-main text-xs italic uppercase tracking-wider">
                    NO ACTIVE REQUESTS SUBMITTED
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {requests.map((req) => (
                    <div key={req.id} className="p-4 bg-surface-hover rounded-lg border border-border-main space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-text-main tracking-wider">
                          {req.type.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          req.status === 'rejected' ? 'bg-accent-red/20 text-accent-red' :
                          'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-main font-sans line-clamp-2">
                        {req.reason}
                      </p>
                      
                      <div className="text-[10px] text-muted-main/80 uppercase pt-2 border-t border-border-main/40 flex items-center justify-between">
                        <span>FILED BY: {req.userName}</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Partner-only Approval Controls */}
                      {isPartner && req.status === 'pending' ? (
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex-1 py-1.5 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded hover:bg-emerald-700 transition-colors"
                          >
                            APPROVE
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="flex-1 py-1.5 bg-accent-red text-white font-bold text-[10px] uppercase rounded hover:bg-red-700 transition-colors"
                          >
                            REJECT
                          </button>
                        </div>
                      ) : !isPartner && req.status === 'pending' ? (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase italic pt-1">
                          AWAITING PARTNER APPROVAL
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
