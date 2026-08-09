import type { AgentEvent } from './types';

export class EventStream {
  private events: AgentEvent[] = [];
  private listeners: Array<(event: AgentEvent) => void> = [];

  public logEvent(event: Omit<AgentEvent, 'id' | 'timestamp'>): AgentEvent {
    const fullEvent: AgentEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      ...event
    };

    this.events.push(fullEvent);
    this.listeners.forEach(fn => fn(fullEvent));
    return fullEvent;
  }

  public getEvents(): AgentEvent[] {
    return [...this.events];
  }

  public subscribe(listener: (event: AgentEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public clear(): void {
    this.events = [];
  }
}
