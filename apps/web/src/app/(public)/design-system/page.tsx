'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Alert,
  Badge,
  StatusBadge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Pagination,
  Skeleton,
  Breadcrumb,
  Rating,
  Timeline,
  FileUploader,
  DatePicker,
  EmptyState,
  ErrorState,
  Dialog,
  ConfirmationDialog,
  Drawer,
  Tooltip,
  ToastProvider,
  useToast,
} from '@legalhub/ui';

function DesignSystemShowcaseContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('forms');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [radioValue, setRadioValue] = useState('property');
  const [ratingValue, setRatingValue] = useState(4.5);
  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <Container className="space-y-10">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <Breadcrumb
            items={[
              { label: 'LegalHubMumbai', href: '/' },
              { label: 'Internal Design System', isCurrent: true },
            ]}
          />
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-serif">
              Production Design System
            </h1>
            <Badge variant="navy">Phase 04 Verified</Badge>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl">
            Clean, high-contrast, accessible visual primitives engineered specifically for legal marketplace trust, clarity, security, and speed.
          </p>
        </div>

        {/* Tabs System */}
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="forms">Form Controls</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Modals</TabsTrigger>
            <TabsTrigger value="data">Data & Badges</TabsTrigger>
            <TabsTrigger value="legal">Legal Components</TabsTrigger>
          </TabsList>

          {/* TAB 1: FORM CONTROLS */}
          <TabsContent value="forms" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Buttons & Actions</CardTitle>
                <CardDescription>Primary, secondary, outline, ghost, danger, success, and loading states.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary (Dark)</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="danger">Destructive Action</Button>
                  <Button variant="success">Success Action</Button>
                  <Button variant="primary" isLoading>Loading</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inputs, Textarea & Selects</CardTitle>
                <CardDescription>Full support for helper text, error messages, and disabled states.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Lawyer Bar Council Sanad Number"
                  placeholder="e.g. MAH/1234/2015"
                  helperText="Format: MAH/RegistrationNumber/Year"
                  isRequired
                />
                <Input
                  label="Email Address"
                  defaultValue="invalid-email-address"
                  errorMessage="Please enter a valid email address."
                  isRequired
                />
                <Select
                  label="Mumbai Court Jurisdiction"
                  options={[
                    { value: 'bhc', label: 'Bombay High Court' },
                    { value: 'city_civil', label: 'City Civil and Sessions Court (Fort)' },
                    { value: 'dindoshi', label: 'Dindoshi Court (Goregaon)' },
                    { value: 'bandra', label: 'Bandra Metropolitan Court' },
                  ]}
                  isRequired
                />
                <DatePicker
                  label="Preferred Consultation Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Property Case Details"
                    placeholder="Describe your title search, registration or conveyancing requirement..."
                    rows={3}
                    helperText="Include property location (e.g. Bandra West) and current status."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selection Controls & Toggles</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Checkbox label="I accept Bar Council of Maharashtra terms" description="Required for all booking consultations." />
                  <Checkbox label="Disabled option" disabled />
                  <Checkbox label="Error option" errorMessage="You must check this box to proceed." />
                </div>
                <div className="space-y-4">
                  <RadioGroup
                    name="practice_area"
                    label="Select Legal Matter Category"
                    value={radioValue}
                    onChange={setRadioValue}
                    options={[
                      { value: 'property', label: 'Property Conveyancing & Sale Deed' },
                      { value: 'rera', label: 'RERA Disputes & Builder Delays' },
                      { value: 'title', label: 'Title Search & 7/12 Extract Verification' },
                    ]}
                  />
                  <Switch
                    label="Available for Instant Consultations"
                    description="Allow verified clients to book same-day appointment slots."
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: FEEDBACK & MODALS */}
          <TabsContent value="feedback" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts & Callouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="info" title="₹299 Consultation Unlock Fee">
                  Payment of ₹299 unlocks lawyer contact credentials and reserves a 30-minute legal consultation.
                </Alert>
                <Alert variant="success" title="Sanad KYC Verified">
                  Your Bar Council of Maharashtra & Goa credentials have been approved by the governance team.
                </Alert>
                <Alert variant="warning" title="Document Pending Review">
                  Awaiting Title Search Report from Advocate Rajesh Mehta.
                </Alert>
                <Alert variant="error" title="Payment Authorization Failed">
                  Your bank declined the transaction. Please try another payment method.
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Modals, Drawers & Toast Notifications</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => setIsDialogOpen(true)}>
                  Open Standard Dialog
                </Button>
                <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                  Open Confirmation Dialog
                </Button>
                <Button variant="secondary" onClick={() => setIsDrawerOpen(true)}>
                  Open Right Drawer Panel
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: 'Payment Successful',
                      description: '₹299 unlock fee captured via Razorpay.',
                      variant: 'success',
                    })
                  }
                >
                  Trigger Success Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast({
                      title: 'Dispute Raised',
                      description: 'Case dossier transferred to admin mediation team.',
                      variant: 'warning',
                    })
                  }
                >
                  Trigger Warning Toast
                </Button>
                <Tooltip content="Verified Mumbai Property Advocate">
                  <Badge variant="brand">Hover for Tooltip</Badge>
                </Tooltip>
              </CardContent>
            </Card>

            {/* Empty & Error States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                title="No Active Bookings"
                description="You currently have no scheduled consultations. Search our catalog of verified Mumbai lawyers."
                actionText="Find a Lawyer"
                onAction={() => {}}
              />
              <ErrorState
                title="Unable to connect to registry"
                description="Maharashtra Land Records (MahaBhulekh) connection timed out."
                onRetry={() => {}}
              />
            </div>
          </TabsContent>

          {/* TAB 3: DATA & BADGES */}
          <TabsContent value="data" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Status Badges & Domain Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="verified" />
                  <StatusBadge status="under_review" />
                  <StatusBadge status="unverified" />
                  <StatusBadge status="pending_unlock_payment" />
                  <StatusBadge status="unlocked" />
                  <StatusBadge status="completed" />
                  <StatusBadge status="disputed" />
                  <StatusBadge status="rejected" />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Badge variant="default">Default Badge</Badge>
                  <Badge variant="brand">Brand Badge</Badge>
                  <Badge variant="navy">Navy Badge</Badge>
                  <Badge variant="success">Success Badge</Badge>
                  <Badge variant="warning">Warning Badge</Badge>
                  <Badge variant="error">Error Badge</Badge>
                  <Badge variant="outline">Outline Badge</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Table & Pagination</CardTitle>
                <CardDescription>High readability data grid for admin queues and lawyer earnings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Advocate</TableHead>
                      <TableHead>Practice Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fee (INR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono font-medium">LHM-2026-0812</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name="Rahul Sharma" size="sm" />
                          <span>Rahul Sharma</span>
                        </div>
                      </TableCell>
                      <TableCell>Adv. Priya Deshmukh</TableCell>
                      <TableCell>Property Registration</TableCell>
                      <TableCell><StatusBadge status="unlocked" /></TableCell>
                      <TableCell className="font-semibold">₹299</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-medium">LHM-2026-0813</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name="Anand Kulkarni" size="sm" />
                          <span>Anand Kulkarni</span>
                        </div>
                      </TableCell>
                      <TableCell>Adv. Rajesh Mehta</TableCell>
                      <TableCell>Title Verification</TableCell>
                      <TableCell><StatusBadge status="completed" /></TableCell>
                      <TableCell className="font-semibold">₹299</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Placeholders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: LEGAL DOMAIN COMPONENTS */}
          <TabsContent value="legal" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation & KYC Timeline</CardTitle>
                  <CardDescription>Step-by-step milestone progression for client tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Timeline
                    events={[
                      {
                        id: '1',
                        title: 'Booking Requested',
                        description: 'Client initiated consultation for Sale Deed Review in Bandra West.',
                        timestamp: '12 Sep 2026, 10:30 AM',
                        status: 'completed',
                      },
                      {
                        id: '2',
                        title: '₹299 Unlock Fee Paid',
                        description: 'Razorpay transaction captured. Lawyer details disclosed.',
                        timestamp: '12 Sep 2026, 10:32 AM',
                        status: 'completed',
                      },
                      {
                        id: '3',
                        title: 'Lawyer Consultation Scheduled',
                        description: 'Adv. Rajesh Mehta confirmed appointment for 15 Oct 2026, 2:00 PM.',
                        timestamp: '12 Sep 2026, 11:15 AM',
                        status: 'current',
                      },
                      {
                        id: '4',
                        title: 'Document Review & Opinion Delivered',
                        description: 'Final verified legal advice uploaded to client vault.',
                        status: 'pending',
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Rating & Review</CardTitle>
                    <CardDescription>Interactive and static star ratings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Interactive Rating Input</p>
                      <Rating value={ratingValue} isInteractive onChange={setRatingValue} showText />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Verified Advocate Badge</p>
                      <div className="flex items-center gap-3">
                        <Avatar name="Adv. Rajesh Mehta" size="lg" status="online" />
                        <div>
                          <p className="font-bold text-slate-900">Adv. Rajesh Mehta</p>
                          <p className="text-xs text-slate-500">Bombay High Court & RERA</p>
                          <Rating value={4.9} reviewCount={48} showText />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Document Vault Uploader</CardTitle>
                    <CardDescription>Drag & drop legal deeds with file type & size checking.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploader
                      onFilesSelected={() => {}}
                      uploadedFiles={[
                        {
                          id: 'doc_1',
                          name: 'Registered_Sale_Deed_Bandra.pdf',
                          size: 4.2 * 1024 * 1024,
                          type: 'application/pdf',
                          status: 'completed',
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog Instance */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Schedule Lawyer Consultation"
          description="Select your preferred appointment mode with Advocate Rajesh Mehta."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
                Confirm Slot
              </Button>
            </>
          }
        >
          <div className="space-y-4 py-2">
            <DatePicker label="Consultation Date" value={selectedDate} onChange={setSelectedDate} />
            <Select
              label="Meeting Mode"
              options={[
                { value: 'video', label: 'Secure Video Call (Google Meet)' },
                { value: 'office', label: 'In-Person (Fort Chamber Office)' },
                { value: 'phone', label: 'Telephone Consultation' },
              ]}
            />
          </div>
        </Dialog>

        {/* Confirmation Dialog Instance */}
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => setIsConfirmOpen(false)}
          title="Cancel Consultation Booking?"
          message="Are you sure you want to cancel this booking? If the lawyer has already begun document review, refund policies will apply."
          confirmText="Yes, Cancel Booking"
          variant="danger"
        />

        {/* Drawer Instance */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Advocate Sanad Credentials"
          footer={
            <Button variant="primary" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Close Inspection
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border rounded-lg">
              <p className="text-xs text-slate-500">Sanad Registration</p>
              <p className="font-mono font-bold text-slate-900">MAH/4521/2012</p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <p className="text-xs text-slate-500">State Bar Council</p>
              <p className="text-sm font-semibold text-slate-900">Bar Council of Maharashtra and Goa</p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <p className="text-xs text-slate-500">Primary Court</p>
              <p className="text-sm font-semibold text-slate-900">Bombay High Court (Appellate Side)</p>
            </div>
          </div>
        </Drawer>
      </Container>
    </main>
  );
}

export default function DesignSystemShowcasePage() {
  return (
    <ToastProvider>
      <DesignSystemShowcaseContent />
    </ToastProvider>
  );
}
