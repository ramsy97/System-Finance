'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Mail, Phone, Percent, CreditCard } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const res = await api.get('/settings'); return res.data; },
  });

  const settings = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage company settings and configurations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5" /> Company Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{settings?.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-right max-w-[300px]">{settings?.address || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax ID (NPWP)</span><span className="font-medium">{settings?.taxId || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice Prefix</span><span className="font-medium">{settings?.invoicePrefix || 'INV'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Percent className="h-3.5 w-3.5" /> Tax Rate (PPN)</span><span className="font-medium">{settings?.taxRate || 11}%</span></div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Email & WhatsApp</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">SMTP Host</span><span className="font-medium">{settings?.emailSmtpHost || 'Not configured'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SMTP Port</span><span className="font-medium">{settings?.emailSmtpPort || '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SMTP User</span><span className="font-medium">{settings?.emailSmtpUser || 'Not configured'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> WhatsApp API</span><span className="font-medium">{settings?.waApiUrl ? 'Configured' : 'Not configured'}</span></div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">Export All Data (Excel)</Button>
              <Button variant="outline" className="w-full justify-start">Backup Database</Button>
              <Button variant="outline" className="w-full justify-start">View Audit Logs</Button>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">System Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-medium">1.0.0</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Updated</span><span className="font-medium">{settings?.updatedAt ? formatDate(settings.updatedAt) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Database</span><span className="font-medium">PostgreSQL</span></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
