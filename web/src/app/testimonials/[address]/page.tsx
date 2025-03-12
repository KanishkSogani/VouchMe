import TestimonialsClient from "./TestimonialsClient";

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}

export async function generateStaticParams() {
  const exampleAddresses = [
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdef1234567890abcdef1234567890abcdef12",
  ];

  return exampleAddresses.map((address) => ({
    address,
  }));
}
