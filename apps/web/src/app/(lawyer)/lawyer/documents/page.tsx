'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Badge,
  Button,
  Spinner,
  Alert,
} from '@legalhub/ui';
import {
  FileText,
  Download,
  Search,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../../lib/auth/context';
import { Navbar } from '../../../../components/layout/navbar';
import { Footer } from '../../../../components/layout/footer';
import { LawyerPortalNav } from '../../../../components/lawyer/lawyer-portal-nav';
import { getLawyerAllDocuments } from '../../../../lib/services/lawyer-dashboard.service';
import { generateSecureDocumentDownloadUrl } from '../../../../lib/services/document.service';
import type { BookingDocument } from '@legalhub/types';
import { formatDate } from '@legalhub/utils';

export default function LawyerDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<BookingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lawyerUid = user?.uid || 'lawyer-1';

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getLawyerAllDocuments(lawyerUid);
        if (res.success) setDocuments(res.documents);
      } catch {
        setErrorMessage('Failed to load consultation documents');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [lawyerUid]);

  const handleDownload = async (doc: BookingDocument) => {
    setDownloadingDocId(doc.id);
    try {
      const urlRes = await generateSecureDocumentDownloadUrl(doc.id, lawyerUid, 'lawyer');
      if (urlRes.success && urlRes.downloadUrl) {
        window.open(urlRes.downloadUrl, '_blank');
      } else {
        alert(urlRes.error || 'Failed to generate download link');
      }
    } catch {
      alert('Error initiating document download');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const filteredDocs = documents.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.originalFilename.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q) ||
      d.bookingId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <LawyerPortalNav />

      <main className="py-8">
        <Container className="max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Client Consultation Document Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Encrypted client uploads, Index II extracts, 30-year title deeds, and completed TSR reports.
              </p>
            </div>
          </div>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{errorMessage}</span>
            </Alert>
          )}

          {/* Search Bar */}
          <Card className="border-slate-200 bg-white shadow-xs mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by filename, document category, or consultation ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents Table / List */}
          {isLoading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-700" />
              <p className="text-xs text-slate-500 mt-2">Loading documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <Card className="border-slate-200 bg-white p-12 text-center">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No client documents found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Client uploads and draft conveyance deeds for your active consultations will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <Card key={doc.id} className="border-slate-200 bg-white shadow-xs hover:shadow-md transition-all">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                          <FileText className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {doc.documentType}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 break-words line-clamp-1">
                          {doc.originalFilename}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Size: {((doc.size || 0) / 1024).toFixed(1)} KB • Uploaded: {formatDate(doc.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Booking: {doc.bookingId.slice(0, 10)}
                      </span>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        isLoading={downloadingDocId === doc.id}
                        className="text-xs"
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                      >
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
