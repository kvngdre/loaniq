import { SessionRepository } from "../../data/repositories/index.js";

export class SessionService {
  static create(createSessionDto, trx) {
    return SessionRepository.insert(createSessionDto, trx);
  }

  static async all() {
    return SessionRepository.find();
  }

  static async get(id) {
    return SessionRepository.findById(id);
  }

  static async getByToken(token) {
    return SessionRepository.findByToken(token);
  }

  static async update(id, updateSessionDto) {
    return SessionRepository.updateById(id, updateSessionDto);
  }

  static async upsert(upsertSessionDto) {
    return SessionRepository.upsert(upsertSessionDto);
  }

  static async delete(id) {
    return SessionRepository.deleteById(id);
  }
}
