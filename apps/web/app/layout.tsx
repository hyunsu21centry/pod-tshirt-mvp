import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="p-4 border-b bg-white flex gap-4">
          <Link href="/">Home</Link><Link href="/designs">Designs</Link><Link href="/customize">Customize</Link><Link href="/cart">Cart</Link><Link href="/order/track">Track</Link><Link href="/admin">Admin</Link><Link href="/producer">Producer</Link>
        </nav>
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
