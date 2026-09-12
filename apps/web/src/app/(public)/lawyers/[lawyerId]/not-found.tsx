import Link from 'next/link';
import { Container, Button, Card, CardContent, Badge } from '@legalhub/ui';
import { Search, Scale } from 'lucide-react';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';

export default function LawyerNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Container className="max-w-lg">
          <Card className="border-slate-200 bg-white text-center shadow-md">
            <CardContent className="p-8 sm:p-10 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Scale className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="text-slate-600 bg-slate-50">
                  Advocate Not Found
                </Badge>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Advocate Profile Not Found
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The requested advocate profile does not exist or has not yet completed Bar Council verification on LegalHubMumbai.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/find-lawyer">
                  <Button variant="primary" fullWidth leftIcon={<Search className="h-4 w-4" />}>
                    Browse Verified Lawyers
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" fullWidth>
                    Return Home
                  </Button>
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
