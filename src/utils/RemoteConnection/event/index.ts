import { RemoteConnection } from '../base';
import EventHandler, { EventName } from './handler';

interface EventItem {
  handler: EventHandler[keyof EventHandler];
  once: boolean;
}

type EventList = Partial<Record<keyof EventHandler, EventItem[]>>;

type EventHandlerRegister = <E extends EventName>(
  eventName: E,
  handler: EventHandler[E],
  options?: {
    once?: boolean;
  },
) => void;

declare module '../base' {
  interface RemoteConnection {
    eventHandlerList: EventList;

    addEventListener: EventHandlerRegister;
    removeEventListener: EventHandlerRegister;
    dispatchEvent<E extends EventName>(eventName: E, ...args: Parameters<EventHandler[E]>): void;
  }
}

RemoteConnection.prototype.eventHandlerList = {};

/**
 * Add event listener
 */
RemoteConnection.prototype.addEventListener = function f(
  eventName,
  handler,
  options = {},
) {
  const handlers = this.eventHandlerList[eventName] ?? [];
  const { once = false } = options;
  const notExists = handlers.every((item) => item.handler !== handler || item.once !== once);

  if (notExists) {
    this.eventHandlerList[eventName] = [
      ...handlers,
      { handler, once },
    ];
  }
};

/**
 * Remove event listener
 */
RemoteConnection.prototype.removeEventListener = function f(
  eventName,
  handler,
  options = {},
) {
  const listeners = this.eventHandlerList[eventName] ?? [];
  const { once = false } = options;
  const index = listeners.findIndex((item) => item.handler === handler && item.once === once);

  if (index !== -1) {
    this.eventHandlerList[eventName] = listeners
      .slice(0, index)
      .concat(listeners.slice(index + 1));
  }
};

/**
 * Dispatch event
 */
RemoteConnection.prototype.dispatchEvent = function f(
  this: RemoteConnection,
  eventName,
  ...args
) {
  const handlers = this.eventHandlerList[eventName] ?? [];

  this.eventHandlerList[eventName] = handlers.filter(({ handler, once }) => {
    (handler as any).apply(this, args);

    return once;
  });
};

export default EventName;
