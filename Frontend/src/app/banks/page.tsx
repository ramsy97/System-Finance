'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Building2, Landmark } from 'lucide-react';

export default function BanksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['banks'],
    queryFn: async () => { const res = await api.get('/banks'); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cash & Bank</h1>
        <p className="text-muted-foreground">Manage bank accounts and cash positions</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((bank: any) => (
            <Card key={bank.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-blue-50">
                    <Landmark className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{bank.bankName}</p>
                    <p className="text-xs text-muted-foreground">{bank.accountNumber}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{bank.holderName}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(bank.account?.balance || 0)}</p>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={bank.status ? 'success' : 'secondary'}>{bank.status ? 'Active' : 'Inactive'}</Badge>
                  <span className="text-xs text-muted-foreground">{bank._count?.mutations || 0} mutations</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
