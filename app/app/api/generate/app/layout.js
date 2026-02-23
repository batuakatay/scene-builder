export const metadata = {
  title: "Scene Builder",
  description: "AI Product Placement Studio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
