'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Briefcase, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  Send, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHRRequests } from '@/lib/hooks/useHRRequests';
import { useClockIn } from '@/lib/hooks/useClockIn';
import type { HRRequestType, ComplaintStatus, HRRequest } from '@/types';

const HR_REQUEST_TYPES: { id: HRRequestType; label: string; icon: React.ComponentType<{ className?: string }>; destructive?: boolean }[] = [
  { id: 'overtime', label: 'Overtime', icon: Clock },
  { id: 'leave', label: 'Leave', icon: Calendar },
  { id: 'schedule_adjustment', label: 'Schedule Adjustment', icon: Clock },
  { id: 'official_business', label: 'Official Business', icon: Briefcase },
  { id: 'certificate_of_attendance', label: 'Certificate of Attendance', icon: FileText },
  { id: 'reimbursement', label: 'Reimbursement', icon: DollarSign },
  { id: 'project_hours_adjustment', label: 'Project Hours Adjustment', icon: Clock },
  { id: 'submit_complaint', label: 'Submit Complaint', icon: AlertTriangle, destructive: true },
];

function getInitialTodayDate() {
  if (typeof window === 'undefined') return '';
  return new Date().toISOString().split('T')[0];
}

export default function HRPage() {
  const { user } = useAuth();
  const { requests, submitRequest, approveRequest, rejectRequest, updateComplaintStatus } = useHRRequests();
  const { isClocked, startTime, todayEntries } = useClockIn();

  const [selectedType, setSelectedType] = useState<HRRequestType>('overtime');
  const [reason, setReason] = useState('');
  
  const [todayStr] = useState(getInitialTodayDate);

  // Form states
  const [otDate, setOtDate] = useState(todayStr);
  const [otIn, setOtIn] = useState('09:00');
  const [otOut, setOtOut] = useState('18:00');
  
  const [leaveType, setLeaveType] = useState<'vacation' | 'sick' | 'personal' | 'emergency'>('vacation');
  const [leaveFrom, setLeaveFrom] = useState(todayStr);
  const [leaveTo, setLeaveTo] = useState(todayStr);
  
  const [reimburseAmount, setReimburseAmount] = useState('');
  const [reimburseDate, setReimburseDate] = useState(todayStr);
  const [reimburseDesc, setReimburseDesc] = useState('');
  
  const [complaintCategory, setComplaintCategory] = useState('Workplace Issue');
  const [complaintDesc, setComplaintDesc] = useState('');
  
  const [genericDate, setGenericDate] = useState(todayStr);

  const [filterTab, setFilterTab] = useState<'all' | 'requests' | 'complaints'>('all');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [investigationNotes, setInvestigationNotes] = useState<Record<string, string>>({});

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4500);
  };

  const syncWithTimesheet = () => {
    const today = new Date().toISOString().split('T')[0];
    setOtDate(today);

    if (isClocked && startTime) {
      const start = new Date(startTime);
      const now = new Date();
      const inTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
      const outTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setOtIn(inTime);
      setOtOut(outTime);
      setReason(`Active timesheet session synced (${inTime} to ${outTime}).`);
      showNotice('success', 'Synced live clock-in session to request form.');
      return;
    }

    if (todayEntries.length > 0) {
      const first = todayEntries[todayEntries.length - 1];
      const last = todayEntries[0];
      const start = new Date(first.startTime);
      const end = new Date(last.endTime || new Date().toISOString());
      const inTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
      const outTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      setOtIn(inTime);
      setOtOut(outTime);
      setReason(`Logged ${todayEntries.length} studio session(s) today. Synced timesheet.`);
      showNotice('success', `Synced ${todayEntries.length} logged timesheet entries.`);
      return;
    }

    showNotice('error', 'No logged timesheet entries found for today yet.');
  };

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
    if (!reason && selectedType !== 'submit_complaint' && selectedType !== 'reimbursement') {
      showNotice('error', 'A clear reason is required to submit this request.');
      return;
    }

    if (selectedType === 'submit_complaint' && !complaintDesc.trim()) {
      showNotice('error', 'Please provide detailed facts for the complaint / grievance.');
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
        details = { amount: Number(reimburseAmount) || 0, date: reimburseDate, description: reimburseDesc };
        break;
      case 'submit_complaint':
        details = { category: complaintCategory, description: complaintDesc };
        break;
      default:
        details = { date: genericDate };
    }

    const currentUserName = user?.name || 'Arch. Staff';
    const currentUserId = user?.id || 'guest-user';

    submitRequest({
      type: selectedType,
      userId: currentUserId,
      userName: currentUserName,
      calendarDate: selectedType === 'overtime' ? otDate : genericDate,
      clockIn: selectedType === 'overtime' ? otIn : undefined,
      clockOut: selectedType === 'overtime' ? otOut : undefined,
      leaveType: selectedType === 'leave' ? leaveType : undefined,
      dateFrom: selectedType === 'leave' ? leaveFrom : undefined,
      dateTo: selectedType === 'leave' ? leaveTo : undefined,
      amount: selectedType === 'reimbursement' ? Number(reimburseAmount) || 0 : undefined,
      category: selectedType === 'submit_complaint' ? complaintCategory : undefined,
      reason: reason || (selectedType === 'submit_complaint' ? complaintDesc : reimburseDesc),
      details,
    });

    setReason('');
    setComplaintDesc('');
    setReimburseDesc('');
    showNotice('success', selectedType === 'submit_complaint' ? 'Confidential complaint filed with partner directory.' : 'HR request submitted successfully.');
  };

  const isPartner = user?.role === 'partner';
  const isSenior = user?.role === 'senior_architect';
  const canReviewRequests = isPartner || isSenior;

  const handleApprove = (req: HRRequest) => {
    if (!user) return;
    const res = approveRequest(req.id, user);
    if (!res.success) {
      showNotice('error', res.error || 'Approval failed.');
    } else {
      showNotice('success', `Request approved for ${req.userName}`);
    }
  };

  const handleReject = (req: HRRequest) => {
    if (!user) return;
    const res = rejectRequest(req.id, user, 'Rejected upon management ledger review.');
    if (!res.success) {
      showNotice('error', res.error || 'Rejection failed.');
    } else {
      showNotice('success', `Request rejected for ${req.userName}`);
    }
  };

  const handleComplaintStatusChange = (complaintId: string, nextStatus: ComplaintStatus) => {
    if (!user) return;
    const note = investigationNotes[complaintId];
    const res = updateComplaintStatus(complaintId, nextStatus, user, note);
    if (!res.success) {
      showNotice('error', res.error || 'Failed to update complaint status.');
    } else {
      showNotice('success', `Complaint stage updated to: ${nextStatus.replace('_', ' ')}`);
    }
  };

  const activeTypeDef = HR_REQUEST_TYPES.find(t => t.id === selectedType);

  const visibleRequests = requests.filter((r) => {
    const isComplaint = r.type === 'submit_complaint';
    const isOwner = (r.userId && r.userId === user?.id) || (r.userName && r.userName.toLowerCase() === user?.name.toLowerCase());

    if (isComplaint) {
      if (!isPartner && !isOwner) return false;
    } else {
      if (!canReviewRequests && !isOwner) return false;
    }

    if (filterTab === 'requests') return !isComplaint;
    if (filterTab === 'complaints') return isComplaint;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-mono transition-colors pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-border-main pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Human Resources (HR)</h1>
          <p className="text-accent-cyan text-xs font-semibold">
            File workplace clearances, track attendance ledgers, and manage confidential requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-3 py-1 font-semibold rounded capitalize tracking-wide border ${
            isPartner ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' : isSenior ? 'bg-blue-500/20 text-blue-600 border-blue-500/40' : 'bg-surface-hover text-muted-main border-border-main'
          }`}>
            Role: {user?.role ? user.role.replace('_', ' ') : 'Junior Architect'}
          </span>
          <span className="text-[10px] px-3 py-1 font-semibold rounded tracking-wide border border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
            Real-Time Sync
          </span>
        </div>
      </header>

      {/* Global Alert Notification Banner */}
      {actionNotice && (
        <div className={`mb-6 p-4 rounded-xl border text-xs font-semibold tracking-wide flex items-center gap-3 transition-all ${
          actionNotice.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
        }`}>
          {actionNotice.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: FILE REQUEST FORM */}
        <div className="lg:w-[55%] flex flex-col gap-6">
          
          {/* SECTION 1: Type Selection */}
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1 text-text-main">Select Request Flow</h2>
            <p className="text-muted-main text-xs mb-4">
              Choose an action below to activate its parameters. A clear reason is required for all submittals.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {HR_REQUEST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                let btnClass = "border rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ";
                
                if (type.destructive) {
                  if (isSelected) {
                    btnClass += "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold shadow-xs";
                  } else {
                    btnClass += "bg-transparent border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs font-bold";
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
                    <span className="text-center text-[11px] leading-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: Dynamic Form */}
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-border-main pb-3">
              <h3 className="text-xs font-bold tracking-wide text-text-main flex items-center gap-2">
                <span>{activeTypeDef?.label} Parameters</span>
                {selectedType === 'submit_complaint' && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-semibold">
                    Confidential Grievance
                  </span>
                )}
              </h3>
              
              {/* Sync with Timesheet Action for time-based requests */}
              {['overtime', 'project_hours_adjustment'].includes(selectedType) && (
                <button
                  type="button"
                  onClick={syncWithTimesheet}
                  className="px-2.5 py-1 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Import hours logged from the live Clock-In widget"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync with Timesheet</span>
                </button>
              )}
            </div>

            <div className="space-y-5">
              {selectedType === 'overtime' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-muted-main font-semibold">Calendar Date</label>
                      <input 
                        type="date" 
                        value={otDate}
                        onChange={(e) => setOtDate(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-muted-main font-semibold">Actual Clock-In</label>
                      <input 
                        type="time" 
                        value={otIn}
                        onChange={(e) => setOtIn(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] text-muted-main font-semibold">Actual Clock-Out</label>
                      <input 
                        type="time" 
                        value={otOut}
                        onChange={(e) => setOtOut(e.target.value)}
                        className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg" 
                      />
                    </div>
                  </div>
                  <div className="bg-surface-hover/80 p-4 rounded-lg border border-border-main flex items-start gap-3">
                    <Info className="text-accent-cyan w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-text-main mb-1 flex items-center gap-2">
                        Calculated Overtime Hours:
                        <span className="text-accent-cyan font-mono text-sm font-bold">{calculateOvertime()} hrs</span>
                      </p>
                      <p className="text-[11px] text-muted-main">
                        (Clock-in + 9 standard working hours) — Clock-out threshold
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'leave' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-main font-semibold">Leave Type</label>
                    <select 
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value as typeof leaveType)}
                      className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono focus:outline-none text-text-main rounded-lg"
                    >
                      <option value="vacation">Vacation Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="emergency">Emergency Leave</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-main font-semibold">Date From</label>
                    <input 
                      type="date" 
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-main font-semibold">Date To</label>
                    <input 
                      type="date" 
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {selectedType === 'reimbursement' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-main font-semibold">Amount (PHP / USD)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={reimburseAmount}
                      onChange={(e) => setReimburseAmount(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-muted-main font-semibold">Expense Date</label>
                    <input 
                      type="date" 
                      value={reimburseDate}
                      onChange={(e) => setReimburseDate(e.target.value)}
                      className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono text-text-main rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {selectedType === 'submit_complaint' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Complaint / Grievance Category</label>
                    <select 
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="bg-surface-hover border border-rose-500/40 px-3 py-2 text-xs font-mono text-text-main rounded-lg"
                    >
                      <option value="Workplace Issue">Workplace Issue</option>
                      <option value="Harassment">Harassment / Misconduct</option>
                      <option value="Payroll Dispute">Payroll / Overtime Dispute</option>
                      <option value="Safety Hazard">Site Safety Hazard</option>
                      <option value="Ethics Violation">Ethics / Code of Conduct Violation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">Detailed Grievance Statement *</label>
                    <textarea 
                      rows={4}
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      placeholder="Describe specific dates, personnel involved, location, and facts of the grievance for confidential partner investigation..."
                      className="bg-surface-hover border border-rose-500/40 p-3 text-xs font-mono focus:outline-none focus:border-rose-500 text-text-main rounded-lg"
                    />
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                    <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Confidential HR Submission</p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        This submittal is directed strictly to partner management for ethical investigation and resolution.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {['schedule_adjustment', 'official_business', 'certificate_of_attendance', 'project_hours_adjustment'].includes(selectedType) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-muted-main font-semibold">Effective Date</label>
                  <input 
                    type="date" 
                    value={genericDate}
                    onChange={(e) => setGenericDate(e.target.value)}
                    className="bg-surface-hover border border-border-main px-3 py-2 text-xs font-mono text-text-main rounded-lg max-w-xs" 
                  />
                </div>
              )}

              {/* Standard Reason Field */}
              {selectedType !== 'submit_complaint' && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-[11px] text-muted-main font-semibold">Reason for HR Request *</label>
                  <textarea 
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="State the clear reason and project context to assist partner review..."
                    className="bg-surface-hover border border-border-main p-3 text-xs font-mono focus:outline-none focus:border-accent-cyan text-text-main rounded-lg placeholder:text-muted-main/60"
                  />
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className={`w-full py-2.5 px-6 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                  activeTypeDef?.destructive
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Submit {activeTypeDef?.label}</span>
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: REQUESTS LEDGER & COMPLAINTS WORKFLOW */}
        <div className="lg:w-[45%]">
          <section className="bg-surface-main border border-border-main rounded-xl p-6 shadow-sm h-full flex flex-col">
            <div className="border-b border-border-main pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-main mb-0.5">Requests & Clearances Ledger</h2>
                <p className="text-muted-main text-xs">
                  Registered submittals & confidential audits
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-lg border border-border-main text-xs font-semibold">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${filterTab === 'all' ? 'bg-surface-main text-text-main shadow-xs' : 'text-muted-main'}`}
                >
                  All ({visibleRequests.length})
                </button>
                <button
                  onClick={() => setFilterTab('requests')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${filterTab === 'requests' ? 'bg-surface-main text-text-main shadow-xs' : 'text-muted-main'}`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setFilterTab('complaints')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${filterTab === 'complaints' ? 'bg-surface-main text-rose-600 dark:text-rose-400 shadow-xs' : 'text-muted-main'}`}
                >
                  Complaints
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-start">
              {visibleRequests.length === 0 ? (
                <div className="border border-dashed border-border-strong rounded-xl p-8 text-center bg-surface-hover/30 my-auto">
                  <p className="text-muted-main text-xs italic">
                    No registered submittals in this category
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto max-h-[700px] pr-1">
                  {visibleRequests.map((req) => {
                    const isComplaint = req.type === 'submit_complaint';
                    const isSelfSubmitted = (req.userId && req.userId === user?.id) || (req.userName && req.userName.toLowerCase() === user?.name.toLowerCase());

                    return (
                      <div 
                        key={req.id} 
                        className={`p-4 rounded-xl border space-y-3 transition-all ${
                          isComplaint 
                            ? 'bg-rose-500/5 border-rose-500/30' 
                            : 'bg-surface-hover border-border-main'
                        }`}
                      >
                        {/* Submittal Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isComplaint ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-accent-cyan shrink-0" />
                            )}
                            <span className="text-xs font-bold text-text-main capitalize">
                              {req.type.replace(/_/g, ' ')}
                            </span>
                            {req.category && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-muted-main">
                                {req.category}
                              </span>
                            )}
                          </div>

                          {/* Status Badge */}
                          {isComplaint ? (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize tracking-wide border ${
                              req.complaintStatus === 'resolved' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40' :
                              req.complaintStatus === 'dismissed' ? 'bg-rose-500/20 text-rose-600 border-rose-500/40' :
                              req.complaintStatus === 'investigating' ? 'bg-purple-500/20 text-purple-600 border-purple-500/40' :
                              'bg-amber-500/20 text-amber-600 border-amber-500/40'
                            }`}>
                              {(req.complaintStatus || 'submitted').replace('_', ' ')}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize tracking-wide ${
                              req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                              req.status === 'rejected' ? 'bg-rose-500/20 text-rose-600' :
                              'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}>
                              {req.status}
                            </span>
                          )}
                        </div>

                        {/* Reason / Statement */}
                        <p className="text-xs text-text-main font-sans leading-relaxed">
                          {req.reason}
                        </p>

                        {/* Investigator / Resolution Notes if available */}
                        {req.investigatorNotes && (
                          <div className="p-2.5 rounded-lg bg-surface-main border border-border-main text-xs text-muted-main space-y-1">
                            <span className="font-semibold text-accent-cyan text-[10px] block">Investigation Findings:</span>
                            <p className="font-sans italic">{req.investigatorNotes}</p>
                          </div>
                        )}

                        {/* Submittal Details Footer */}
                        <div className="text-[11px] text-muted-main pt-2 border-t border-border-main/50 flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">Filed by: {req.userName}</span>
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* REVIEWER AUDIT STAMP */}
                        {req.reviewedBy && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                            Reviewed by {req.reviewedBy} ({req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'Confirmed'})
                          </div>
                        )}

                        {/* ACTION CONTROLS MATRIX */}
                        {!isComplaint && req.status === 'pending' && (
                          <div className="pt-2 border-t border-border-main/40">
                            {canReviewRequests ? (
                              isSelfSubmitted ? (
                                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-600 font-semibold text-center flex items-center justify-center gap-1.5">
                                  <Lock className="w-3 h-3" />
                                  <span>Self-approval prohibited (Governance enforced)</span>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(req)}
                                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                                  >
                                    Approve Request
                                  </button>
                                  <button
                                    onClick={() => handleReject(req)}
                                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                                  >
                                    Reject Request
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium italic flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Awaiting partner / senior clearance</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. COMPLAINT INVESTIGATION & RESOLUTION CONSOLE (PARTNER ONLY) */}
                        {isComplaint && (
                          <div className="pt-2 border-t border-border-main/40 space-y-2.5">
                            {isPartner ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-main">
                                  <span>Investigation Actions:</span>
                                  <span className="text-rose-600 dark:text-rose-400 font-bold">Partner Console</span>
                                </div>

                                <input
                                  type="text"
                                  placeholder="Add confidential investigation findings or action notes..."
                                  value={investigationNotes[req.id] || ''}
                                  onChange={(e) => setInvestigationNotes({ ...investigationNotes, [req.id]: e.target.value })}
                                  className="w-full bg-surface-main border border-border-main rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                                />

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                                  <button
                                    onClick={() => handleComplaintStatusChange(req.id, 'under_review')}
                                    className="py-1 px-2 bg-surface-hover hover:bg-border-main text-text-main font-semibold text-[10px] rounded border border-border-main cursor-pointer"
                                  >
                                    Under Review
                                  </button>
                                  <button
                                    onClick={() => handleComplaintStatusChange(req.id, 'investigating')}
                                    className="py-1 px-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 font-semibold text-[10px] rounded border border-purple-500/40 cursor-pointer"
                                  >
                                    Investigating
                                  </button>
                                  <button
                                    onClick={() => handleComplaintStatusChange(req.id, 'resolved')}
                                    className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] rounded shadow-xs cursor-pointer"
                                  >
                                    Resolve
                                  </button>
                                  <button
                                    onClick={() => handleComplaintStatusChange(req.id, 'dismissed')}
                                    className="py-1 px-2 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-[10px] rounded shadow-xs cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-main flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                                  Confidential investigation active
                                </span>
                                <span className="text-amber-600 font-semibold capitalize">
                                  {(req.complaintStatus || 'submitted').replace('_', ' ')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
