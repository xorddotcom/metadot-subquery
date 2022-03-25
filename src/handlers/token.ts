import { Token } from "../types";

export async function ensureToken(id: string, decimals: bigint): Promise<void> {
  const token = await Token.get(id);

  if (!token) {
    const token = new Token(id);

    token.name = id;
    token.decimals = decimals;

    await token.save();
  }
}
