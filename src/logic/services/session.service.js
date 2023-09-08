import { SessionRepository } from "../../data/repositories/index.js";

export class SessionService {
  static create(createSessionDto, trx) {
    // In milliseconds
    const tokenExpirationTime = process.env.JWT_REFRESH_TTL * 1_000;

    return SessionRepository.insert(
      {
        ...createSessionDto,
        loginTime: new Date(),
        expiresIn: Date.now() + tokenExpirationTime,
      },
      trx,
    );
  }
}
