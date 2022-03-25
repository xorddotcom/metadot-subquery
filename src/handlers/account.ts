import { Account } from "../types";

export async function ensureAccount(id: string): Promise<Account> {
  const account = await Account.get(id);

  if (!account) {
    const acc = new Account(id);
    acc.transferTotalCount = 0;
    acc.save();

    return acc;
  }
}

export async function ensureAccounts(ids: string[]): Promise<void> {
  for (const id of ids) {
    const account = await Account.get(id);
    if (!account) {
      await new Account(id).save();
    }
  }
}

export async function getAccountById(id: string): Promise<Account> {
  await ensureAccount(id);

  const account = await Account.get(id);

  return account;
}

export async function updateAccount(id: string, data: Record<string, number>): Promise<void> {
  const account = await getAccountById(id);

  Object.entries(data).forEach(([key, value]) => {
    account[key] = value;
  });

  await account.save();
}

export async function updateTransferStatistic(id: string): Promise<void> {
  const account = await getAccountById(id);

  await updateAccount(id, { transferTotalCount: account.transferTotalCount + 1 });
}
