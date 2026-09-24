'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HRRequest, HRRequestStatus, ComplaintStatus, User } from '@/types';

const STORAGE_KEY = 'arkipelago_hr_requests';
const EVENT_NAME = 'arkipelago_hr_updated';

const SEED_HR_REQUESTS: HRRequest[] = [
  {
    id: 'hr-seed-001',
    type: 'overtime',
    userId: 'junior-user-id',
    userName: 'Arch. Testing3',
    calendarDate: '2026-09-22',
    clockIn: '09:00',
    clockOut: '21:30',
    reason: 'Extended schematic 3D modeling for Makati Tower Phase 2 client presentation.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    details: { date: '2026-09-22', clockIn: '09:00', clockOut: '21:30', computedHours: '3.5' },
  },
  {
    id: 'hr-seed-002',
    type: 'leave',
    userId: 'senior-user-id',
    userName: 'Arch. Testing2',
    reason: 'Annual family leave scheduled after schematic milestone delivery.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewedBy: 'Arch. Testing1',
    reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    leaveType: 'vacation',
    dateFrom: '2026-10-05',
    dateTo: '2026-10-08',
    details: { leaveType: 'vacation', dateFrom: '2026-10-05', dateTo: '2026-10-08' },
  },
  {
    id: 'hr-seed-003',
    type: 'submit_complaint',
    userId: 'junior-user-id',
    userName: 'Arch. Testing3',
    reason: 'Continuous safety hazard observed at BGC Pavilion structural basement site without safety netting.',
    status: 'pending',
    complaintStatus: 'under_review',
    category: 'Safety Hazard',
    isConfidential: true,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    details: { category: 'Safety Hazard', description: 'Continuous safety hazard observed at BGC Pavilion structural basement site without safety netting.' },
    investigatorNotes: 'Noted. Senior management notified the contractor site lead to install safety perimeter immediately.',
  },
];

function getStoredRequests(): HRRequest[] {
  if (typeof window === 'undefined') return SEED_HR_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HR_REQUESTS));
      return SEED_HR_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading HR requests from storage', e);
    return SEED_HR_REQUESTS;
  }
}

export function useHRRequests() {
  const [requests, setRequests] = useState<HRRequest[]>(getStoredRequests);

  const syncRequests = useCallback(() => {
    setRequests(getStoredRequests());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncRequests();
    };
    const handleCustom = () => syncRequests();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_NAME, handleCustom);

    // BroadcastChannel support for low-latency multi-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('arkipelago_hr_channel');
      bc.onmessage = () => syncRequests();
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_NAME, handleCustom);
      if (bc) bc.close();
    };
  }, [syncRequests]);

  const broadcastChange = (updated: HRRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('arkipelago_hr_channel');
        bc.postMessage('updated');
        bc.close();
      }
    } catch (e) {
      console.error('Failed to broadcast HR change', e);
    }
    setRequests(updated);
  };

  /**
   * Submit a new HR request or complaint
   */
  const submitRequest = useCallback((
    newReqData: Omit<HRRequest, 'id' | 'createdAt' | 'status'> & {
      status?: HRRequestStatus;
      complaintStatus?: ComplaintStatus;
    }
  ) => {
    const isComplaint = newReqData.type === 'submit_complaint';

    const created: HRRequest = {
      ...newReqData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `hr-${Date.now()}`,
      status: isComplaint ? 'pending' : (newReqData.status || 'pending'),
      complaintStatus: isComplaint ? (newReqData.complaintStatus || 'submitted') : undefined,
      isConfidential: isComplaint ? true : newReqData.isConfidential,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredRequests();
    const updated = [created, ...current];
    broadcastChange(updated);
    return created;
  }, []);

  /**
   * Standard Request Approval (Partners & Approved Senior Architects with Four-Eye Principle)
   */
  const approveRequest = useCallback((requestId: string, reviewer: User) => {
    const isAuthorized = reviewer.role === 'partner' || reviewer.role === 'senior_architect';
    if (!isAuthorized) {
      return { success: false, error: 'AUTHORIZATION DENIED: Only Partners and Senior Architects have clearance to approve HR requests.' };
    }

    const current = getStoredRequests();
    const target = current.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found.' };

    // STRICT SELF-APPROVAL PREVENTION (Four-Eye Governance)
    if (
      (target.userId && target.userId === reviewer.id) ||
      (target.userName && target.userName.toLowerCase() === reviewer.name.toLowerCase()) ||
      (reviewer.email && target.userName.toLowerCase().includes(reviewer.email.split('@')[0].toLowerCase()))
    ) {
      return { success: false, error: 'SECURITY VIOLATION: Self-approval is strictly prohibited under studio governance rules.' };
    }

    const updated = current.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved' as const,
          reviewedBy: `${reviewer.name} (${reviewer.role.replace('_', ' ').toUpperCase()})`,
          reviewedAt: new Date().toISOString(),
        };
      }
      return r;
    });

    broadcastChange(updated);
    return { success: true };
  }, []);

  /**
   * Standard Request Rejection (Partners & Approved Senior Architects)
   */
  const rejectRequest = useCallback((requestId: string, reviewer: User, reason?: string) => {
    const isAuthorized = reviewer.role === 'partner' || reviewer.role === 'senior_architect';
    if (!isAuthorized) {
      return { success: false, error: 'AUTHORIZATION DENIED: Only Partners and Senior Architects have clearance to reject HR requests.' };
    }

    const current = getStoredRequests();
    const target = current.find((r) => r.id === requestId);
    if (!target) return { success: false, error: 'Request not found.' };

    if (
      (target.userId && target.userId === reviewer.id) ||
      (target.userName && target.userName.toLowerCase() === reviewer.name.toLowerCase())
    ) {
      return { success: false, error: 'SECURITY VIOLATION: You cannot reject/approve your own submittal.' };
    }

    const updated = current.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected' as const,
          reviewedBy: `${reviewer.name} (${reviewer.role.replace('_', ' ').toUpperCase()})`,
          reviewedAt: new Date().toISOString(),
          resolutionNotes: reason,
        };
      }
      return r;
    });

    broadcastChange(updated);
    return { success: true };
  }, []);

  /**
   * Grievance / Complaint Lifecycle Update (Investigation, Review, Notes)
   */
  const updateComplaintStatus = useCallback((
    complaintId: string,
    newStatus: ComplaintStatus,
    reviewer: User,
    notes?: string
  ) => {
    if (reviewer.role !== 'partner') {
      return { success: false, error: 'AUTHORIZATION DENIED: Only Partners can manage confidential grievance investigations.' };
    }

    const current = getStoredRequests();
    const target = current.find((r) => r.id === complaintId);
    if (!target) return { success: false, error: 'Complaint not found.' };

    const updated = current.map((r) => {
      if (r.id === complaintId) {
        return {
          ...r,
          complaintStatus: newStatus,
          status: newStatus === 'resolved' ? ('approved' as const) : newStatus === 'dismissed' ? ('rejected' as const) : ('pending' as const),
          reviewedBy: reviewer.name,
          reviewedAt: new Date().toISOString(),
          investigatorNotes: notes !== undefined ? notes : r.investigatorNotes,
          resolutionNotes: newStatus === 'resolved' || newStatus === 'dismissed' ? (notes || r.resolutionNotes) : r.resolutionNotes,
        };
      }
      return r;
    });

    broadcastChange(updated);
    return { success: true };
  }, []);

  return {
    requests,
    submitRequest,
    approveRequest,
    rejectRequest,
    updateComplaintStatus,
    refreshRequests: syncRequests,
  };
}
