'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart3, TrendingUp, BookOpen, DollarSign, Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

function downloadReport(type: string, format: 'pdf' | 'excel') {
  const token = getToken();
  const params = new URLSearchParams();
  const now = new Date();
  params.set('startDate', new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
  params.set('endDate', now.toISOString().split('T')[0]);
  const url = `${API_URL}/reports/export/${type}/${format}?${params.toString()}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
  if (token) link.setAttribute('data-authorization', `Bearer ${token}`);
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${type}-report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(console.error);
}

const reports = [
  { title: 'Trial Balance', icon: BookOpen, key: 'trial-balance', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Income Statement', icon: TrendingUp, key: 'income-statement', color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'Balance Sheet', icon: BarChart3, key: 'balance-sheet', color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'Cash Flow', icon: DollarSign, key: 'cash-flow', color: 'text-orange-600', bg: 'bg-orange-50' },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: trialBalance, isLoading: tbLoading } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: async () => { const res = await api.get('/reports/trial-balance'); return res.data; },
  });

  const { data: incomeStatement, isLoading: isLoading } = useQuery({
    queryKey: ['income-statement'],
    queryFn: async () => { const res = await api.get('/reports/income-statement'); return res.data; },
  });

  const handleDownload = async (type: string, format: 'pdf' | 'excel') => {
    const key = `${type}-${format}`;
    setDownloading(key);
    try {
      await downloadReport(type, format);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">View, download PDF, or export Excel reports</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((r) => (
          <Card key={r.key} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${r.bg}`}>
                  <r.icon className={`h-6 w-6 ${r.color}`} />
                </div>
                <p className="font-semibold">{r.title}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handleDownload(r.key, 'pdf')}
                  disabled={downloading === `${r.key}-pdf`}
                >
                  {downloading === `${r.key}-pdf` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handleDownload(r.key, 'excel')}
                  disabled={downloading === `${r.key}-excel`}
                >
                  {downloading === `${r.key}-excel` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                  )}
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Income Statement</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload('income-statement', 'pdf')}>
                {downloading === 'income-statement-pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload('income-statement', 'excel')}>
                {downloading === 'income-statement-excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Revenue</p>
                  {incomeStatement?.data?.revenues?.map((r: any) => (
                    <div key={r.code} className="flex justify-between text-sm pl-4">
                      <span className="text-muted-foreground">{r.name}</span>
                      <span>{formatCurrency(r.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Revenue</span>
                    <span className="text-green-600">{formatCurrency(incomeStatement?.data?.totalRevenue || 0)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Expenses</p>
                  {incomeStatement?.data?.expenses?.map((e: any) => (
                    <div key={e.code} className="flex justify-between text-sm pl-4">
                      <span className="text-muted-foreground">{e.name}</span>
                      <span>{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span>Total Expenses</span>
                    <span className="text-red-600">{formatCurrency(incomeStatement?.data?.totalExpenses || 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-base font-bold border-t-2 pt-2">
                  <span>Net Income</span>
                  <span className={incomeStatement?.data?.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(incomeStatement?.data?.netIncome || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Trial Balance</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload('trial-balance', 'pdf')}>
                {downloading === 'trial-balance-pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload('trial-balance', 'excel')}>
                {downloading === 'trial-balance-excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tbLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Account</th>
                      <th className="pb-2 font-medium text-right">Debit</th>
                      <th className="pb-2 font-medium text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance?.data?.entries?.slice(0, 15).map((e: any) => (
                      <tr key={e.code} className="border-b">
                        <td className="py-2">{e.code} - {e.name}</td>
                        <td className="py-2 text-right text-green-600">{e.debitBalance > 0 ? formatCurrency(e.debitBalance) : '-'}</td>
                        <td className="py-2 text-right text-red-600">{e.creditBalance > 0 ? formatCurrency(e.creditBalance) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t-2">
                      <td className="pt-2">Total</td>
                      <td className="pt-2 text-right">{formatCurrency(trialBalance?.data?.totalDebit || 0)}</td>
                      <td className="pt-2 text-right">{formatCurrency(trialBalance?.data?.totalCredit || 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
