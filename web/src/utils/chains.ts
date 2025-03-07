import { citreaTestnet } from "@/utils/chains/CitreaTestnet";
import { ethereumClassic } from "@/utils/chains/EthereumClassic";
import { milkomeda } from "@/utils/chains/Milkomeda";
import { mainnet, polygon, scrollSepolia } from "wagmi/chains";
import { mordor } from "@/utils/chains/Mordor";

// Combine all chains into a single export
export const chains = [
  scrollSepolia,
  polygon,
  mainnet,
  citreaTestnet,
  ethereumClassic,
  milkomeda,
  mordor,
] as const;
