import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@legalhub/ui';

interface BookingDetailPageProps {
  params: { bookingId: string };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <Container>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Route: /booking/{params.bookingId}</Badge>
            </div>
            <CardTitle>Booking Status & Timeline</CardTitle>
            <CardDescription>
              Route foundation established. Consultation details, document upload, and payment unlock will be implemented in future phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    </main>
  );
}
