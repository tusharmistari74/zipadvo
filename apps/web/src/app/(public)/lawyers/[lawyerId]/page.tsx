import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Breadcrumb } from '@legalhub/ui';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerHeader } from '../../../../components/lawyer-profile/lawyer-header';
import { LawyerServicesFees } from '../../../../components/lawyer-profile/lawyer-services-fees';
import { LawyerAvailability } from '../../../../components/lawyer-profile/lawyer-availability';
import { LawyerReviews } from '../../../../components/lawyer-profile/lawyer-reviews';
import { BookingUnlockCard } from '../../../../components/lawyer-profile/booking-unlock-card';
import { getPublicLawyerProfile } from '../../../../lib/services/lawyer-profile.service';

interface LawyerProfilePageProps {
  params: { lawyerId: string };
}

export async function generateMetadata({ params }: LawyerProfilePageProps): Promise<Metadata> {
  const profile = await getPublicLawyerProfile(params.lawyerId);

  if (!profile) {
    return {
      title: 'Advocate Profile Not Found | ZipAdvo',
      description: 'The requested lawyer profile could not be found or is not currently active for public discovery.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const primaryPractice = profile.practiceAreas[0] || 'Property & Conveyancing';
  const pageTitle = `${profile.fullName} | Verified ${primaryPractice} Advocate in Mumbai`;
  const pageDescription = `Consult ${profile.fullName}, Sanad-verified advocate in ${profile.locality}, Mumbai. ${profile.yearsOfExperience}+ years experience in ${profile.practiceAreas.slice(0, 3).join(', ')}. Direct contact unlock for ₹299.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'profile',
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
    alternates: {
      canonical: `/lawyers/${profile.id}`,
    },
    robots: {
      index: profile.isSanadVerified,
      follow: profile.isSanadVerified,
    },
  };
}

export default async function LawyerProfilePage({ params }: LawyerProfilePageProps) {
  const profile = await getPublicLawyerProfile(params.lawyerId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white py-3">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Find a Lawyer', href: '/find-lawyer' },
              { label: profile.fullName },
            ]}
          />
        </Container>
      </div>

      {/* Main Profile Grid */}
      <main className="py-8 sm:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Full Credentials & Bio */}
            <div className="lg:col-span-8 space-y-6">
              {/* Profile Identity & Sanad Header */}
              <LawyerHeader profile={profile} />

              {/* Specializations & Service Offerings */}
              <LawyerServicesFees profile={profile} />

              {/* Chamber & Consultation Availability */}
              <LawyerAvailability profile={profile} />

              {/* Client Reviews & Feedback */}
              <LawyerReviews profile={profile} />
            </div>

            {/* Right Column: Sticky Unlock & Booking Card */}
            <div className="lg:col-span-4">
              <BookingUnlockCard profile={profile} />
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
