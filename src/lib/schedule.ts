import { StudioMeeting, MeetingType } from '@/types';

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WeekDayInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNameShort: string; // 'MON', 'TUE', etc.
  dayNameFull: string; // 'Monday', 'Tuesday'
  dayNum: string; // '05'
  monthShort: string; // 'OCT'
  isToday: boolean;
  isPast: boolean;
}

/**
 * Returns the 7 days of the week containing the given reference date (Monday - Sunday)
 */
export function getWeekDates(refDate: Date = new Date()): WeekDayInfo[] {
  const curr = new Date(refDate);
  const dayOfWeek = curr.getDay(); // 0 is Sunday, 1 is Monday
  // Distance to Monday (if Sunday (0), distance is -6 days; otherwise 1 - dayOfWeek)
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const todayStr = formatLocalDate(new Date());

  const days: WeekDayInfo[] = [];
  const shortNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(d);

    days.push({
      date: d,
      dateStr,
      dayNameShort: shortNames[i],
      dayNameFull: fullNames[i],
      dayNum: String(d.getDate()).padStart(2, '0'),
      monthShort: monthNames[d.getMonth()],
      isToday: dateStr === todayStr,
      isPast: d < new Date(new Date().setHours(0, 0, 0, 0)),
    });
  }

  return days;
}

/**
 * Dynamic sample meetings calibrated around the current active week
 */
export function getInitialStudioMeetings(refDate: Date = new Date()): StudioMeeting[] {
  const week = getWeekDates(refDate);
  const mon = week[0].dateStr;
  const tue = week[1].dateStr;
  const wed = week[2].dateStr;
  const thu = week[3].dateStr;
  const fri = week[4].dateStr;
  const sat = week[5].dateStr;

  return [
    {
      id: 'mtg-01',
      title: 'Makati Tower Phase 2 — Client Facade & Core Review',
      client: 'Ayala Land Corp',
      projectCode: 'MT-2024',
      date: mon,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      type: 'Client Review',
      source: 'CALENDLY',
      location: 'Studio Boardroom A / Google Meet',
      meetingLink: 'https://meet.google.com/ark-makati-rev',
      attendees: ['Arch. Principal Partner', 'Elena Gomez (Client)', 'Engr. Mark Tan'],
      description: 'Review updated curtain wall facade iterations, shadow study renderings, and elevator core coordination.',
      status: 'confirmed',
    },
    {
      id: 'mtg-02',
      title: 'Casa Verde Biophilic Residence — Foundation Slump & Footing Inspection',
      client: 'Dr. & Arch. Santos',
      projectCode: 'CV-2024',
      date: tue,
      startTime: '02:00 PM',
      endTime: '04:30 PM',
      type: 'Site Inspection',
      source: 'STUDIO',
      location: 'Antipolo Ridge, Site Lot 4-B',
      attendees: ['Arch. Senior Associate', 'Engr. Site Contractor'],
      description: 'Perform slump test for column footings C1-C4. Verify 3000 PSI ready-mix transit time and rebar cage ties.',
      status: 'confirmed',
    },
    {
      id: 'mtg-03',
      title: 'Siargao Eco-Kite Resort — Solar Microgrid & MEPFS Coordination',
      client: 'Pacific Drift Holdings',
      projectCode: 'SK-2025',
      date: wed,
      startTime: '09:30 AM',
      endTime: '11:00 AM',
      type: 'Design Coordination',
      source: 'GOOGLE',
      location: 'Virtual Conference 2',
      meetingLink: 'https://meet.google.com/ark-siargao-mep',
      attendees: ['Arch. Junior Draftsman', 'Engr. Solar Tech Lead', 'MEP Consultant'],
      description: 'Finalize inverter room placement, rooftop PV panel azimuth orientation, and rainwater harvesting conduit routing.',
      status: 'confirmed',
    },
    {
      id: 'mtg-04',
      title: 'Tagaytay Ridge Villa — Zoning Board & BP 344 Variance Submittal',
      client: 'Montenegro Holdings',
      projectCode: 'TRH-2024',
      date: thu,
      startTime: '01:30 PM',
      endTime: '03:00 PM',
      type: 'Permitting',
      source: 'STUDIO',
      location: 'City Planning & Engineering Office, Tagaytay City',
      attendees: ['Arch. Carlos Mendoza', 'Liaison Officer Ramos'],
      description: 'Submit stamped variance documents for setback clearances and accessible ramp gradient compliance (BP 344).',
      status: 'confirmed',
    },
    {
      id: 'mtg-05',
      title: 'Makati Tower Phase 2 — Structural Column Pour Sign-Off',
      client: 'Ayala Land Corp',
      projectCode: 'MT-2024',
      date: fri,
      startTime: '03:30 PM',
      endTime: '05:00 PM',
      type: 'Site Inspection',
      source: 'STUDIO',
      location: 'Makati CBD Site Office B-2',
      attendees: ['Arch. Carlos Mendoza', 'Engr. Site Contractor', 'QA/QC Inspector'],
      description: 'Final pre-pour checklist sign-off for Level 14 shear wall intersection and embedded sleeve verification.',
      status: 'confirmed',
    },
    {
      id: 'mtg-06',
      title: 'Studio Design Charette — Siargao Beach Pavilion Concepts',
      client: 'Internal Studio Lab',
      projectCode: 'SK-2025',
      date: sat,
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      type: 'Design Coordination',
      source: 'STUDIO',
      location: 'Estudio Arkipelago Drafting Room',
      attendees: ['Entire Architectural Team'],
      description: 'Internal design review of parametric bamboo roof joinery and natural cross-ventilation CFD simulations.',
      status: 'confirmed',
    }
  ];
}

export function getTypeBadgeStyles(type: MeetingType): {
  bg: string;
  border: string;
  text: string;
  iconColor: string;
  label: string;
} {
  switch (type) {
    case 'Site Inspection':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        iconColor: 'text-amber-500',
        label: 'Site Inspection',
      };
    case 'Client Review':
      return {
        bg: 'bg-accent-cyan/10',
        border: 'border-accent-cyan/30',
        text: 'text-accent-cyan',
        iconColor: 'text-accent-cyan',
        label: 'Client Review',
      };
    case 'Design Coordination':
      return {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-600 dark:text-indigo-400',
        iconColor: 'text-indigo-500',
        label: 'Design Coord',
      };
    case 'Permitting':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-600 dark:text-rose-400',
        iconColor: 'text-rose-500',
        label: 'Permitting / City',
      };
    default:
      return {
        bg: 'bg-surface-hover',
        border: 'border-border-main',
        text: 'text-text-main',
        iconColor: 'text-muted-main',
        label: type,
      };
  }
}
