import './globals.css';

export const metadata = {
  title: 'Exam Question Paper Locker',
  description: 'Secure, time-locked exam release portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

