import "./globals.css";

export const metadata = {
  title: {
    default: "Event Management System",
    template: "%s · Event Management",
  },
  description: "Create, manage and track events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
