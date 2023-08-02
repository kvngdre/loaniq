import logger from "../utils/logger.js";

class PubSub {
  #events = {};

  subscribe = (eventName, fn) => {
    // logger.silly(`Subscribed to know about ${eventName}`)

    // Add an event to an existing list or as new
    this.#events[eventName] = this.#events[eventName] || [];
    this.#events[eventName].push(fn);
  };

  unsubscribe = (eventName, fn) => {
    logger.silly(`Unsubscribing from ${eventName}`);

    if (this.#events[eventName]) {
      this.#events[eventName] = this.#events[eventName].filter((f) => f !== fn);
    }
  };

  async publish(eventName, id, data, trx) {
    logger.silly(`Making a broadcast about ${eventName} event.`);

    // Emit or publish the event to anyone who is subscribed.
    if (this.#events[eventName]) {
      const handlers = this.#events[eventName];
      if (!!handlers === false) return;

      for (const fn of handlers) {
        if (id == null) await fn(data, trx);
        else await fn(id, data, trx);
      }
    }
  }
}

export default new PubSub();
