'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JournalForm } from '@/components/journal-form';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Loader2, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

export default function JournalPage() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => { const res = await api.get('/journal-entries', { params: { limit: 20 } }); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground">View and manage general journal entries</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <JournalForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4 font-medium">Entry #</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium text-right">Items</th>
                  <th className="p-4 font-medium">System</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((entry: any) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs font-medium">{entry.entryNumber}</td>
                    <td className="p-4">{formatDateShort(entry.date)}</td>
                    <td className="p-4"><Badge variant="outline">{entry.type}</Badge></td>
                    <td className="p-4 text-muted-foreground">{entry.description || '-'}</td>
                    <td className="p-4 text-right">{entry.items?.length || 0} items</td>
                    <td className="p-4">
                      <Badge variant={entry.isSystemGenerated ? 'secondary' : 'default'}>
                        {entry.isSystemGenerated ? 'Auto' : 'Manual'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No journal entries found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
