import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Administration", default: "Administration" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
