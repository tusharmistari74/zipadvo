import { Container, Card, CardContent, Skeleton } from '@legalhub/ui';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';

export default function LawyerProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <div className="border-b border-slate-200 bg-white py-3">
        <Container>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-slate-300">/</span>
            <Skeleton className="h-4 w-24" />
            <span className="text-slate-300">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </Container>
      </div>

      <main className="py-8 sm:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-8 space-y-6">
              {/* Header Card Skeleton */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-48" />
                      <div className="flex items-center gap-4 pt-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>

              {/* Services Skeleton */}
              <Card className="border-slate-200 bg-white shadow-xs">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-32 rounded-lg" />
                    <Skeleton className="h-7 w-40 rounded-lg" />
                    <Skeleton className="h-7 w-36 rounded-lg" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-4">
              <Card className="border-slate-200 bg-white shadow-md">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-5 w-48" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
