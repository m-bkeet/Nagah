// Google Meet API Integration Service for Nagah M-S
import { GoogleDriveService } from './googleDrive';

export interface GoogleMeetSpace {
  name: string; // e.g. "spaces/1234abcd"
  meetingUri: string; // e.g. "https://meet.google.com/abc-defg-hij"
  meetingCode: string; // e.g. "abc-defg-hij"
  config?: {
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
    entryPointAccess?: 'ALL' | 'CREATOR_APP_ONLY';
  };
}

export class GoogleMeetService {
  private static MEET_SPACES_URL = 'https://meet.googleapis.com/v2/spaces';

  /**
   * Create a new Google Meet space / link for an online session or group lecture
   */
  static async createMeetingSpace(options?: {
    topic?: string;
    accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  }): Promise<GoogleMeetSpace> {
    const token = await GoogleDriveService.requestAccessToken();

    const instantMeetFallback = (): GoogleMeetSpace => ({
      name: `spaces/instant-${Date.now()}`,
      meetingUri: 'https://meet.google.com/new',
      meetingCode: 'new',
      config: {
        accessType: options?.accessType || 'OPEN'
      }
    });

    // Without an active Google OAuth token, open Google Meet's official instant-create URL
    if (!token) {
      return instantMeetFallback();
    }

    try {
      const response = await fetch(this.MEET_SPACES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            accessType: options?.accessType || 'OPEN'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn('[GoogleMeet] Direct API response error, falling back to meet.google.com/new:', errText);
        return instantMeetFallback();
      }

      const data = await response.json();
      return {
        name: data.name || '',
        meetingUri: data.meetingUri || (data.meetingCode ? `https://meet.google.com/${data.meetingCode}` : 'https://meet.google.com/new'),
        meetingCode: data.meetingCode || 'new',
        config: data.config
      };
    } catch (err: any) {
      console.warn('[GoogleMeet] Exception creating space:', err);
      return instantMeetFallback();
    }
  }

  /**
   * Launch / Join a Google Meet conference
   */
  static openMeeting(meetingUri: string) {
    if (meetingUri) {
      window.open(meetingUri, '_blank', 'noopener,noreferrer');
    }
  }
}
