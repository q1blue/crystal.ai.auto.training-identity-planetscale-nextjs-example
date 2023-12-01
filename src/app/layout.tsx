'use client';

import '../styles/globals.css';
import Container from '@/components/Container';
import { AuthContextProvider } from '@/context/authContext';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <AuthContextProvider>
          <main>
            <Hero />
            <Container>{children}</Container>
          </main>
        </AuthContextProvider>
        <Footer />
      </body>
    </html>
  );
}
