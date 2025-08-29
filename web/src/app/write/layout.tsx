import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write Testimonial - VouchMe",
  description:
    "Write testimonials for people you've worked with. Share honest feedback about colleagues, clients, or collaborators on VouchMe's secure blockchain platform.",
  openGraph: {
    title: "Write Testimonial - VouchMe",
    description:
      "Write testimonials for people you've worked with. Share honest feedback about colleagues, clients, or collaborators on VouchMe's secure blockchain platform.",
    images: [
      {
        url: "/vouchme.png",
        width: 1200,
        height: 630,
        alt: "Write Testimonial - VouchMe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Write Testimonial - VouchMe",
    description:
      "Write testimonials for people you've worked with. Share honest feedback about colleagues, clients, or collaborators on VouchMe's secure blockchain platform.",
    images: ["/vouchme.png"],
  },
};

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
