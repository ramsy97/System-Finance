'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateShort, cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', search],
    queryFn: async () => {
      const res = await api.get('/transactions', { params: { search, limit: 20 } });
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage financial transactions</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
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
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Account</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((tx: any) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-mono text-xs">{tx.transactionNo}</td>
                      <td className="py-3">{formatDateShort(tx.date)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("p-0.5 rounded", tx.type === 'CASH_IN' ? 'bg-green-50' : tx.type === 'CASH_OUT' ? 'bg-red-50' : 'bg-blue-50')}>
                            {tx.type === 'CASH_IN' ? <ArrowUp className="h-3.5 w-3.5 text-green-600" /> : tx.type === 'CASH_OUT' ? <ArrowDown className="h-3.5 w-3.5 text-red-600" /> : <ArrowUp className="h-3.5 w-3.5 text-blue-600" />}
                          </div>
                          <span className="text-xs">{tx.type?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3">{tx.account?.name}</td>
                      <td className="py-3 text-muted-foreground max-w-[200px] truncate">{tx.description || '-'}</td>
                      <td className={cn("py-3 font-medium", tx.type === 'CASH_IN' ? 'text-green-600' : tx.type === 'CASH_OUT' ? 'text-red-600' : 'text-blue-600')}>
                        {tx.type === 'CASH_IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3">
                        <Badge variant={tx.approvalStatus === 'APPROVED' ? 'success' : tx.approvalStatus === 'REJECTED' ? 'destructive' : 'warning'}>
                          {tx.approvalStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {data?.data?.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found</td></tr>
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
