export type SessionEventType =
  | 'SESSION_REMINDER'
  | 'SESSION_STARTED'
  | 'SESSION_FIVE_MINUTES'
  | 'SESSION_ENDED'
  | 'SESSION_CELEBRATION'
  | 'STAR_WINNER';

export interface SessionEvent {
  id: string;
  sessionId: string;
  groupId: string;
  groupName?: string;
  courseName?: string;
  trainerName?: string;
  eventType: SessionEventType;
  createdAt: string;
  starWinnerName?: string;
  starWinnerPoints?: number;
  metadata?: Record<string, any>;
}

export type Unsubscribe = () => void;

class SessionEventsService extends EventTarget {
  private processedEvents = new Set<string>();

  public isEventProcessedLocally(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  public markEventProcessedLocally(eventId: string): void {
    this.processedEvents.add(eventId);
  }

  public async dispatchSessionEvent(
    eventData: Omit<SessionEvent, 'id' | 'createdAt'>
  ): Promise<SessionEvent | null> {
    const eventId = `${eventData.sessionId}_${eventData.eventType}`;
    const newEvent: SessionEvent = {
      ...eventData,
      id: eventId,
      createdAt: new Date().toISOString()
    };
    this.markEventProcessedLocally(eventId);
    this.dispatchEvent(new CustomEvent('session_event', { detail: newEvent }));
    return newEvent;
  }

  public listenToGroupSessionEvents(
    groupId: string,
    onNewEvent: (event: SessionEvent) => void
  ): Unsubscribe {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SessionEvent>;
      if (customEvent.detail && customEvent.detail.groupId === groupId) {
        onNewEvent(customEvent.detail);
      }
    };
    this.addEventListener('session_event', handler);
    return () => this.removeEventListener('session_event', handler);
  }

  public listenToAllSessionEvents(
    onNewEvent: (event: SessionEvent) => void
  ): Unsubscribe {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SessionEvent>;
      if (customEvent.detail) {
        onNewEvent(customEvent.detail);
      }
    };
    this.addEventListener('session_event', handler);
    return () => this.removeEventListener('session_event', handler);
  }
}

export const sessionEventsService = new SessionEventsService();
