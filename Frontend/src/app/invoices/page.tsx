'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InvoiceForm } from '@/components/invoice-form';
import { formatCurrency, formatDateShort, cn } from '@/lib/utils';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const statusBadge: Record<string, 'success' | 'warning' | 'destructive' | 'default' | 'info' | 'secondary'> = {
  PAID: 'success',
  DRAFT: 'secondary',
  SENT: 'info',
  PARTIALLY_PAID: 'warning',
  OVERDUE: 'destructive',
  CANCELLED: 'destructive',
};

export default function InvoicesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search],
    queryFn: async () => {
      const res = await api.get('/invoices', { params: { search, limit: 20 } });
      return res.data;
    },
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage sales and purchase invoices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Invoice</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Due Date</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((invoice: any, i: number) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="py-3">{invoice.contact?.name}</td>
                      <td className="py-3">{formatDateShort(invoice.date)}</td>
                      <td className="py-3">{formatDateShort(invoice.dueDate)}</td>
                      <td className="py-3 font-medium">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-3">
                        <Badge variant={statusBadge[invoice.status] || 'default'}>{invoice.status}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={invoice.approvalStatus === 'APPROVED' ? 'success' : invoice.approvalStatus === 'REJECTED' ? 'destructive' : 'warning'}>
                          {invoice.approvalStatus}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                  {data?.data?.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
