'use client';

import React, { useState } from 'react';
import { Container, Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, Badge } from '@legalhub/ui';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '../../../components/layout/navbar';
import { Footer } from '../../../components/layout/footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'client_inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate clean submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'client_inquiry',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-slate-50/50 py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center space-y-3">
            <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
              <Mail className="h-3.5 w-3.5 mr-1" />
              Direct Support & Assistance
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Get in Touch with ZipAdvo
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Have questions regarding advocate verification, document encryption, or consultation bookings?
              Our dedicated support team is here to help.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                  Contact Information
                </h2>
                <p className="text-sm text-slate-600">
                  Reach out via email, phone, or connect with our corporate office.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Corporate & Operations Office</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Nandanvan appartment, bus stop, 13, Kalyan-Murbad Rd, near prem auto, Purnima, Kalyan, Maharashtra 421301
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Email & Direct Helpline</h3>
                      <p className="text-xs text-slate-600 mt-1">
                        General Support: <a href="mailto:zipadvo@gmail.com" className="text-blue-700 font-semibold hover:underline">zipadvo@gmail.com</a>
                      </p>
                      <p className="text-xs text-slate-600">
                        Helpline / WhatsApp: <a href="tel:+917768942390" className="text-emerald-700 font-semibold hover:underline">+91 77689 42390</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Support Hours & SLA</h3>
                      <p className="text-xs text-slate-600 mt-1">Monday – Saturday: 9:00 AM – 8:00 PM IST</p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        Direct helpline & email support: &lt; 1 hour SLA
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <Card className="border-slate-200 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Send Us a Message
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Fill out the form below and an operations specialist will connect with you promptly.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                      <h3 className="text-lg font-bold text-emerald-900">Message Received</h3>
                      <p className="text-sm text-emerald-700">
                        Thank you for contacting ZipAdvo. A member of our support team has been notified and
                        will respond to you within 2 business hours.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSuccess(false)}
                        className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 mt-2"
                      >
                        Send Another Inquiry
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Your Full Name *
                          </label>
                          <Input
                            placeholder="e.g. Rajesh Sharma"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            placeholder="rajesh@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Inquiry Type *
                          </label>
                          <select
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          >
                            <option value="client_inquiry">Client Property / Title Inquiry</option>
                            <option value="advocate_verification">Advocate Sanad & Onboarding</option>
                            <option value="booking_support">₹299 Facilitation / Booking Issue</option>
                            <option value="corporate_inquiry">Corporate / Bulk Conveyancing</option>
                            <option value="other">General Feedback / Inquiries</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Message / Details *
                        </label>
                        <Textarea
                          rows={4}
                          placeholder="Please describe your query, location in Mumbai, or specific document requirement..."
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          isLoading={isSubmitting}
                          leftIcon={<Send className="h-4 w-4" />}
                        >
                          Submit Inquiry
                        </Button>
                      </div>

                      <p className="text-[11px] text-slate-500 text-center">
                        By submitting, you agree to our Privacy Policy. We never sell or share your contact details.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
