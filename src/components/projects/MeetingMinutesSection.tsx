'use client';

import React, { useState } from 'react';
import { MeetingMinute } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  FileText, 
  ListChecks, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingMinutesSectionProps {
  projectId: string;
  projectCode: string;
  projectName?: string;
}

export function MeetingMinutesSection({
  projectId,
  projectCode,
}: MeetingMinutesSectionProps) {
  const [meetings, setMeetings] = useState<MeetingMinute[]>([
    {
      id: 'mm-1',
      projectId,
      title: 'Schematic Phase Alignment & Structural Core Review',
      date: '2026-09-24',
      location: 'Studio Main Boardroom & Google Meet',
      attendees: ['Arch. Leandro Locsin', 'Arch. Carlos Mendoza', 'Mr. David Smith (Client)', 'Engr. Cruz (Structural)'],
      agendaSummary: 'Review of cantilevered balcony overhangs, MEP vertical shafts, and HVAC condenser placements.',
      notes: 'Client expressed approval of the double-volume living area. Requested an additional electrical vehicle outlet in carport bay 3. Structural engineer confirmed maximum balcony projection can reach 2.4m without post supports provided post-tensioned beam depth is maintained at 500mm.',
      actionItems: [
        { task: 'Update Electrical drawing E-101 for EV charging circuit', assignee: 'Engr. Santos', dueDate: '2026-09-28', done: true },
        { task: 'Reflect 2.4m balcony cantilever in section A-301', assignee: 'Elena G.', dueDate: '2026-09-29', done: false },
        { task: 'Issue revised schematic cost breakdown for client signoff', assignee: 'Arch. Carlos Mendoza', dueDate: '2026-09-30', done: false }
      ]
    },
    {
      id: 'mm-2',
      projectId,
      title: 'Initial Client Program & Space Specification Brief',
      date: '2026-09-10',
      location: 'Forbes Park Client Residence',
      attendees: ['Arch. Carlos Mendoza', 'Arch. Sofia Reyes', 'Mr. & Mrs. Smith (Clients)'],
      agendaSummary: 'Review of family room lifestyle, bedroom counts, privacy gradients, and service staff quarters.',
      notes: 'Clients emphasized desire for natural cross-ventilation and protection from high afternoon solar heat gain on the western facade. High priority placed on acoustic separation between the second-floor home cinema and guest bedrooms.',
      actionItems: [
        { task: 'Finalize site sun-path and wind rose diagram', assignee: 'Arch. Sofia Reyes', dueDate: '2026-09-14', done: true },
        { task: 'Send draft space programming spreadsheet', assignee: 'Arch. Carlos Mendoza', dueDate: '2026-09-15', done: true }
      ]
    }
  ]);

  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('Studio Boardroom');
  const [newAttendees, setNewAttendees] = useState('');
  const [newAgenda, setNewAgenda] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleToggleActionItem = (meetingId: string, actionIndex: number) => {
    setMeetings(prev => prev.map(m => {
      if (m.id !== meetingId) return m;
      const updatedActions = m.actionItems.map((item, idx) => {
        if (idx !== actionIndex) return item;
        return { ...item, done: !item.done };
      });
      return { ...m, actionItems: updatedActions };
    }));
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: MeetingMinute = {
      id: `mm-${Date.now()}`,
      projectId,
      title: newTitle.trim(),
      date: newDate,
      location: newLocation.trim() || undefined,
      attendees: newAttendees.split(',').map(s => s.trim()).filter(Boolean),
      agendaSummary: newAgenda.trim(),
      notes: newNotes.trim(),
      actionItems: []
    };
    setMeetings([item, ...meetings]);
    setNewTitle('');
    setNewAgenda('');
    setNewNotes('');
    setNewAttendees('');
    setIsAddMeetingOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              CLIENT MINUTES
            </span>
            <span className="text-xs font-mono text-muted-main">{projectCode}</span>
          </div>
          <h3 className="text-sm font-bold text-text-main mt-1">Official Meeting Minutes & Action Tracker</h3>
        </div>

        <button
          onClick={() => setIsAddMeetingOpen(true)}
          className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Meeting</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-surface-main border border-border-main rounded-xl p-4 space-y-3 hover:border-text-main/30 transition-all shadow-2xs"
          >
            {/* Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-cyan" />
                <h4 className="text-xs font-bold text-text-main">{meeting.title}</h4>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-main">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {meeting.date}
                </span>
                {meeting.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {meeting.location}
                  </span>
                )}
              </div>
            </div>

            {/* Attendees */}
            {meeting.attendees.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[10px] font-semibold text-muted-main uppercase font-mono">Present:</span>
                {meeting.attendees.map((att, i) => (
                  <span key={i} className="bg-surface-hover px-2 py-0.5 rounded text-[10px] font-mono border border-border-main/50 text-text-main">
                    {att}
                  </span>
                ))}
              </div>
            )}

            {/* Notes & Summary */}
            <div className="bg-surface-hover/30 p-3 rounded-lg border border-border-main/40 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-main uppercase font-mono tracking-wider block mb-0.5">
                  Agenda & Discussion Summary:
                </span>
                <p className="text-text-main leading-relaxed">{meeting.agendaSummary}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-main uppercase font-mono tracking-wider block mb-0.5">
                  Detailed Minutes / Architectural Directives:
                </span>
                <p className="text-text-main text-[11px] leading-relaxed whitespace-pre-line">{meeting.notes}</p>
              </div>
            </div>

            {/* Action Items List */}
            {meeting.actionItems.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-muted-main uppercase font-mono tracking-wider flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5 text-accent-cyan" />
                  Action Items & Deliverables:
                </span>
                <div className="space-y-1">
                  {meeting.actionItems.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      onClick={() => handleToggleActionItem(meeting.id, actIdx)}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-hover/40 border border-border-main/40 text-xs cursor-pointer hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={act.done}
                          onChange={() => {}}
                          className="rounded text-black dark:text-white cursor-pointer"
                        />
                        <span className={cn('font-medium', act.done && 'line-through text-muted-main')}>
                          {act.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-main">
                        <span>Assigned: <strong className="text-text-main font-sans">{act.assignee}</strong></span>
                        {act.dueDate && <span>Due: {act.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Record Meeting */}
      {isAddMeetingOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddMeetingOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-cyan" />
                <span>Log Official Client Meeting Minutes</span>
              </h3>
              <button
                onClick={() => setIsAddMeetingOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Development Interior Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Attendees (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Arch. Carlos Mendoza, Mr. Smith, Engr. Cruz"
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Agenda Summary</label>
                <textarea
                  rows={2}
                  placeholder="Key topics discussed..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Detailed Discussion Notes</label>
                <textarea
                  rows={3}
                  placeholder="Architectural directives, agreements reached, changes requested..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Save Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
