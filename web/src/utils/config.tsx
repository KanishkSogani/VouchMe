import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, scrollSepolia } from "wagmi/chains";

// Custom chains
import { ethereumClassic } from "@/utils/chains/EthereumClassic";
import { milkomeda } from "@/utils/chains/Milkomeda";
import { citreaTestnet } from "@/utils/chains/CitreaTestnet";
import { mordor } from "@/utils/chains/Mordor";

const chains = [
  scrollSepolia,
  polygon,
  mainnet,
  citreaTestnet,
  ethereumClassic,
  milkomeda,
  mordor,
] as const;

// Default config without API key (browser wallets only)
export const publicConfig = createConfig({
  chains,
  transports: {
    [scrollSepolia.id]: http(),
    [polygon.id]: http(),
    [mainnet.id]: http(),
    [citreaTestnet.id]: http(),
    [ethereumClassic.id]: http(),
    [milkomeda.id]: http(),
    [mordor.id]: http(),
  },
});

// Config with API key (more wallets)
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
export const enhancedConfig = getDefaultConfig({
  appName: "VouchMe",
  projectId,
  chains,
  ssr: true,
});
