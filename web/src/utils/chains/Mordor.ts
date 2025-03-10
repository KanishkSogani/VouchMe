import { defineChain } from "viem";

export const mordor = defineChain({
  id: 63,
  name: "Mordor Testnet",
  nativeCurrency: { name: "Mordor Ether", symbol: "METC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mordor.etccooperative.org"] },
  },
  blockExplorers: {
    default: { name: "BlockScout", url: "https://blockscout.com/etc/mordor" },
  },
  testnet: true,
});
