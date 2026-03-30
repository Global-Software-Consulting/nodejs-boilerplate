import './globals.css';

export const metadata = {
  title: 'GSoft — Node.js Monorepo',
  description: 'A production-ready Node.js monorepo for building RESTful APIs',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
