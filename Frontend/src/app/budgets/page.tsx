'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Loader2, PiggyBank, TrendingUp } from 'lucide-react';

export default function BudgetsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['budgets-analytics'],
    queryFn: async () => { const res = await api.get('/budgets/analytics'); return res.data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">Plan and track departmental budgets</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data?.data?.summary?.totalBudget || 0)}</p>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{formatCurrency(data?.data?.summary?.totalSpent || 0)}</p>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Usage Rate</p>
                <p className="text-2xl font-bold mt-1">{(data?.data?.summary?.usagePercentage || 0).toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Budget Details</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium text-right">Budget</th>
                    <th className="p-4 font-medium text-right">Spent</th>
                    <th className="p-4 font-medium text-right">Remaining</th>
                    <th className="p-4 font-medium text-right">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.budgets?.slice(0, 20).map((b: any) => {
                    const remaining = Number(b.amount) - Number(b.spent);
                    const usagePct = Number(b.amount) > 0 ? (Number(b.spent) / Number(b.amount)) * 100 : 0;
                    return (
                      <tr key={b.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{b.category?.name}</td>
                        <td className="p-4 text-muted-foreground">{b.department?.name || '-'}</td>
                        <td className="p-4 text-right">{formatCurrency(b.amount)}</td>
                        <td className="p-4 text-right text-orange-600">{formatCurrency(b.spent)}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(remaining)}</td>
                        <td className="p-4 text-right">
                          <Badge variant={usagePct > 100 ? 'destructive' : usagePct > 80 ? 'warning' : 'success'}>
                            {usagePct.toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
