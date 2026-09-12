import Link from 'next/link';
import { Container, Button, Card, CardContent, Badge } from '@legalhub/ui';
import { Search, Home, ShieldAlert } from 'lucide-react';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-slate-50/50">
        <Container className="max-w-xl">
          <Card className="border-slate-200 text-center shadow-md bg-white">
            <CardContent className="p-8 sm:p-12 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldAlert className="h-8 w-8 text-blue-700" />
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="text-slate-600 bg-slate-50">
                  HTTP 404
                </Badge>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Page Not Found
                </h1>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                  The page you are looking for does not exist, has been moved, or is temporarily unavailable.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="primary" fullWidth leftIcon={<Home className="h-4 w-4" />}>
                    Return to Homepage
                  </Button>
                </Link>
                <Link href="/find-lawyer" className="w-full sm:w-auto">
                  <Button variant="outline" fullWidth leftIcon={<Search className="h-4 w-4" />}>
                    Find a Verified Lawyer
                  </Button>
                </Link>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-500">
                <Link href="/how-it-works" className="hover:text-blue-700 underline">
                  How It Works
                </Link>
                <Link href="/for-lawyers" className="hover:text-blue-700 underline">
                  For Lawyers
                </Link>
                <Link href="/contact" className="hover:text-blue-700 underline">
                  Support & Contact
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
