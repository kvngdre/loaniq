import { SessionRepository } from "../../data/repositories/index.js";

export class SessionService {
  static create(createSessionDto, trx) {
    return SessionRepository.insert(createSessionDto, trx);
  }
}
