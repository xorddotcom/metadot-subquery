import { Account } from "../types";

export async function ensureAccount(id: string): Promise<Account> {
  const account = await Account.get(id);

  if (!account) {
    const acc = new Account(id);
    acc.save();

    return acc;
  }
}

export async function ensureAccounts(ids: string[]): Promise<void> {
  for (const id of ids) {
    await ensureAccount(id);
  }
}
