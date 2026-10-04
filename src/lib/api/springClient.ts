/**
 * ESTUDIO ARKIPELAGO — Spring Boot 3 Backend API Client
 * Enterprise REST client with JWT authentication, type safety, and fallback handling.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/spring-api' : 'http://localhost:8080/api');
const TOKEN_KEY = 'arkipelago_jwt_token';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'PARTNER' | 'SENIOR_ARCHITECT' | 'JUNIOR_ARCHITECT' | 'CONTRACTOR' | 'CLIENT';
  avatarUrl?: string;
  phoneNumber?: string;
  assignedProjectCodes?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserDto;
}

export interface TimeEntryDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  projectCode: string;
  projectName: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  durationFormatted: string;
  note?: string;
  billable: boolean;
  active: boolean;
}

export interface ProjectDetailDto {
  id: string;
  code: string;
  name: string;
  clientName?: string;
  status: string;
  contractAmountPhp: number;
  schematicPct: number;
  designDevPct: number;
  contractDocsPct: number;
  biddingPct: number;
  constructionAdminPct: number;
}

export interface PushResponse {
  success: boolean;
  sentCount: number;
  totalTargets: number;
  message: string;
  error?: string;
}

export interface SketchSessionDto {
  id: string;
  projectCode: string;
  sheetCode: string;
  title: string;
  canvasDataJson: string;
  layersJson?: string;
  scaleRatio: string;
  updatedByEmail?: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole?: string;
  threadId: string;
  projectCode?: string;
  content: string;
  attachmentUrl?: string;
  reactionsJson?: string;
  createdAt: string;
}

export interface WallPostDto {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  title: string;
  content: string;
  category: string;
  likesCount: number;
  createdAt: string;
}

class SpringApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  public removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 204) {
      return null as T;
    }

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText || `HTTP ${res.status} Error` };
      }
      throw new Error(errorJson.message || errorJson.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // ==========================================
  // Authentication
  // ==========================================
  public async login(email: string, password: string):Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  public async getMe(): Promise<UserDto> {
    return this.request<UserDto>('/auth/me');
  }

  // ==========================================
  // HR & Time Tracking
  // ==========================================
  public async clockIn(projectCode: string, projectName?: string, note?: string): Promise<TimeEntryDto> {
    return this.request<TimeEntryDto>('/hr/clock-in', {
      method: 'POST',
      body: JSON.stringify({ projectCode, projectName, note, billable: true }),
    });
  }

  public async clockOut(note?: string): Promise<TimeEntryDto> {
    return this.request<TimeEntryDto>('/hr/clock-out', {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  public async getActiveSession(): Promise<TimeEntryDto | null> {
    return this.request<TimeEntryDto | null>('/hr/active-session');
  }

  public async getTodayEntries(): Promise<TimeEntryDto[]> {
    return this.request<TimeEntryDto[]>('/hr/today');
  }

  public async getHistory(): Promise<TimeEntryDto[]> {
    return this.request<TimeEntryDto[]>('/hr/history');
  }

  public async getTeamStatus(): Promise<TimeEntryDto[]> {
    return this.request<TimeEntryDto[]>('/hr/team-status');
  }

  // ==========================================
  // Projects Hub
  // ==========================================
  public async getProjects(): Promise<ProjectDetailDto[]> {
    return this.request<ProjectDetailDto[]>('/projects');
  }

  public async getProject(code: string): Promise<ProjectDetailDto> {
    return this.request<ProjectDetailDto>(`/projects/${code}`);
  }

  // ==========================================
  // Mobile Web Push Notifications
  // ==========================================
  public async subscribePush(subscription: PushSubscription, userEmail?: string): Promise<PushResponse> {
    const subJson = subscription.toJSON();
    return this.request<PushResponse>('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        subscription: {
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
        },
        userEmail,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
      }),
    });
  }

  public async sendPush(message: string, title?: string, targetEmail?: string, url?: string): Promise<PushResponse> {
    return this.request<PushResponse>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify({
        title,
        message,
        targetEmail,
        url,
      }),
    });
  }

  public async testPush(): Promise<PushResponse> {
    return this.request<PushResponse>('/notifications/test', {
      method: 'POST',
    });
  }

  // ==========================================
  // Sketch Studio
  // ==========================================
  public async saveSketch(
    projectCode: string,
    sheetCode: string,
    title: string,
    canvasDataJson: string,
    layersJson?: string,
    scaleRatio = '1:100'
  ): Promise<SketchSessionDto> {
    return this.request<SketchSessionDto>('/sketch/save', {
      method: 'POST',
      body: JSON.stringify({
        projectCode,
        sheetCode,
        title,
        canvasDataJson,
        layersJson,
        scaleRatio,
      }),
    });
  }

  public async getSketch(projectCode: string, sheetCode: string): Promise<SketchSessionDto | null> {
    return this.request<SketchSessionDto | null>(`/sketch/${projectCode}/${sheetCode}`);
  }

  // ==========================================
  // Chat & Studio Wall
  // ==========================================
  public async sendChatMessage(threadId: string, content: string, projectCode?: string, attachmentUrl?: string): Promise<ChatMessageDto> {
    return this.request<ChatMessageDto>('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ threadId, content, projectCode, attachmentUrl }),
    });
  }

  public async getThreadMessages(threadId: string): Promise<ChatMessageDto[]> {
    return this.request<ChatMessageDto[]>(`/chat/threads/${threadId}`);
  }

  public async createWallPost(title: string, content: string, category = 'ANNOUNCEMENT'): Promise<WallPostDto> {
    return this.request<WallPostDto>('/chat/wall', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
    });
  }

  public async getWallPosts(): Promise<WallPostDto[]> {
    return this.request<WallPostDto[]>('/chat/wall');
  }
}

export const springApi = new SpringApiClient();
