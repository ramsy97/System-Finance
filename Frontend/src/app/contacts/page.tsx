'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Building2, User } from 'lucide-react';

export default function ContactsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => { const res = await api.get('/contacts', { params: { limit: 50 } }); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-muted-foreground">Manage customers, suppliers, and vendors</p>
      </div>
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium text-right">Balance</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((c: any) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {c.type === 'CUSTOMER' ? <Building2 className="h-4 w-4 text-muted-foreground" /> : <User className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge variant="outline">{c.type}</Badge></td>
                    <td className="p-4 text-muted-foreground">{c.email || '-'}</td>
                    <td className="p-4 text-muted-foreground">{c.phone || '-'}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(c.balance)}</td>
                    <td className="p-4">
                      <Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
