import { VouchMe__factory } from "@/typechain-types";

export const CONTRACT_ADDRESSES: { [key: number]: string } = {
  534351: "0x270fa4703280ee537574358deeaf62238cad24b7", // Scroll Sepolia
  63: "0x3c9a98c58be8410c3510d5ccc671e35b7df55e08", // Mordor
  61: "0x51a11e08643c9df6ceb5f7fb41a72334cfa7d1d6", // Ethereum Classic
};

export const VouchMeFactory = VouchMe__factory;
