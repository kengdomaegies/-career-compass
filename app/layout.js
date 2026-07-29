import "./globals.css";

export const metadata = {
  title: "Career Compass",
  description: "A short career interest & work-style assessment with a personalized report.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
