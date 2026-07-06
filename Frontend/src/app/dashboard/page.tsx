'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateShort, cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, DollarSign, Receipt, Users, Banknote, AlertCircle, Clock, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/reports/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { title: 'Monthly Revenue', value: stats?.monthlyCashIn || 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { title: 'Monthly Expenses', value: stats?.monthlyCashOut || 0, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { title: 'Total Revenue', value: stats?.revenue || 0, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Total Expenses', value: stats?.expenses || 0, icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  const alertCards = [
    { title: 'Pending Invoices', value: stats?.pendingInvoices || 0, icon: Receipt, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Overdue Invoices', value: stats?.overdueInvoices || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Active Contacts', value: stats?.totalContacts || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial status</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">{card.title}</p>
                <p className={cn("text-2xl font-bold mt-1", card.color)}>{formatCurrency(card.value)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {alertCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.1 }}
          >
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <span className={cn("text-3xl font-bold", card.color)}>{card.value}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={cn("text-3xl font-bold", (stats?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatCurrency(stats?.netIncome || 0)}
              </span>
              {(stats?.netIncome || 0) >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(stats?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium text-red-600">{formatCurrency(stats?.expenses || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentTransactions?.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-full", tx.type === 'CASH_IN' ? 'bg-green-50' : 'bg-red-50')}>
                      {tx.type === 'CASH_IN' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.transactionNo}</p>
                      <p className="text-xs text-muted-foreground">{tx.account?.name} · {formatDateShort(tx.date)}</p>
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold", tx.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600')}>
                    {tx.type === 'CASH_IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
              {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
