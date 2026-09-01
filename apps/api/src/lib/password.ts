import { hash, verify } from "@node-rs/argon2";

// @node-rs/argon2 ships prebuilt binaries for Node, unlike the `argon2`
// package which needs node-gyp + a C++ toolchain on every machine and every
// CI image. Bun's Bun.password is not available since we run on Node.
export function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

export function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
  return verify(hashValue, plain);
}
