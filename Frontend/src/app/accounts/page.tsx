'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AccountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => { const res = await api.get('/accounts', { params: { limit: 50 } }); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <p className="text-muted-foreground">Manage your chart of accounts (CoA)</p>
      </div>
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium text-right">Balance</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((acc: any) => (
                  <tr key={acc.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs">{acc.code}</td>
                    <td className="p-4 font-medium">{acc.name}</td>
                    <td className="p-4"><Badge variant="outline">{acc.type}</Badge></td>
                    <td className="p-4 text-right font-medium">{formatCurrency(acc.balance)}</td>
                    <td className="p-4">
                      <Badge variant={acc.isActive ? 'success' : 'secondary'}>{acc.isActive ? 'Active' : 'Inactive'}</Badge>
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
