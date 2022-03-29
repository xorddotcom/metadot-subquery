import { Balance } from "@polkadot/types/interfaces";
import { SubstrateExtrinsic } from "@subql/types";

export function calculateFees(extrinsic: SubstrateExtrinsic): bigint {
  let depositFees = BigInt(0);
  let treasuryFees = BigInt(0);

  const eventRecordWithdraw = extrinsic.events.find(event => {
    return event.event.section == "balances" && event.event.method == "Withdraw";
  });

  if (eventRecordWithdraw) {
    const {
      event: {
        data: [accountId, fee],
      },
    } = eventRecordWithdraw;

    const extrinsicSigner = extrinsic.extrinsic.signer.toString();
    const withdrawAccountId = accountId.toString();

    return extrinsicSigner === withdrawAccountId ? (fee as Balance).toBigInt() : BigInt(0);
  }

  const eventRecordDeposit = extrinsic.events.find(event => {
    return event.event.section == "balances" && event.event.method == "Deposit";
  });

  const eventRecordTreasury = extrinsic.events.find(event => {
    return event.event.section == "treasury" && event.event.method == "Deposit";
  });

  if (eventRecordDeposit) {
    const {
      event: {
        data: [, fee],
      },
    } = eventRecordDeposit;

    depositFees = (fee as Balance).toBigInt();
  }

  if (eventRecordTreasury) {
    const {
      event: {
        data: [fee],
      },
    } = eventRecordTreasury;

    treasuryFees = (fee as Balance).toBigInt();
  }

  const totalFees = depositFees + treasuryFees;

  return totalFees;
}
