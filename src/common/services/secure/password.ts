import argon2 from 'argon2';

interface PasswordHashing {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

class SecureService implements PasswordHashing {
  hash = async (password: string): Promise<string> => {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
  };
  verify = async (hash: string, password: string): Promise<boolean> => {
    const isValid = await argon2.verify(hash, password);
    return isValid;
  };
}

export { SecureService };
export type { PasswordHashing };
