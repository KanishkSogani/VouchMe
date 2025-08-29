import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimonials - VouchMe",
  description:
    "View authentic testimonials and professional recommendations. Discover verified feedback from colleagues, clients, and collaborators on VouchMe's blockchain platform.",
  openGraph: {
    title: "Testimonials - VouchMe",
    description:
      "View authentic testimonials and professional recommendations. Discover verified feedback from colleagues, clients, and collaborators on VouchMe's blockchain platform.",
    images: [
      {
        url: "/vouchme.png",
        width: 1200,
        height: 630,
        alt: "Testimonials - VouchMe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Testimonials - VouchMe",
    description:
      "View authentic testimonials and professional recommendations. Discover verified feedback from colleagues, clients, and collaborators on VouchMe's blockchain platform.",
    images: ["/vouchme.png"],
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
