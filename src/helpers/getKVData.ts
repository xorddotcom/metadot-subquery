import { AnyTuple, ArgsDef } from "@polkadot/types/types";

export interface KVData {
  key: string;
  type: any;
  value: string;
}

export const getKVData = (data: AnyTuple, keys?: ArgsDef): KVData[] => {
  if (!data) return [];

  if (!keys) {
    return data.map((item, index) => {
      return {
        key: "" + index,
        type: (data as any).typeDef?.[index]?.type?.toString(),
        value: item?.toString(),
      };
    });
  }

  return Object.keys(keys).map((_key, index) => {
    return {
      key: _key,
      type: (data[index] as any).type,
      value: data[index]?.toString(),
    };
  });
};

api.query.system.account.keyPrefix();
