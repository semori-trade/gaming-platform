import jwt from 'jsonwebtoken';

type JwtPayload = Parameters<typeof jwt.sign>[0];

interface Jwt {
  sign(payload: JwtPayload): string;
  verify<T>(token: string): T;
}

class JwtService {
  expiresIn: string;
  #jwtSecret: string;

  constructor(jwtSecret: string, expiresIn: string) {
    this.#jwtSecret = jwtSecret;
    this.expiresIn = expiresIn;
  }

  sign = (payload: JwtPayload) => {
    const token = jwt.sign(payload, this.#jwtSecret, {
      expiresIn: this.expiresIn,
    });

    return token;
  };

  verify = <T>(token: string) => {
    return jwt.verify(token, this.#jwtSecret) as T;
  };
}

export { JwtService };
export type { Jwt };
