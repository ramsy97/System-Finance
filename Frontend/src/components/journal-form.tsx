'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogClose } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

interface JournalFormProps {
  onSuccess?: () => void;
}

export function JournalForm({ onSuccess }: JournalFormProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'GENERAL' | 'ADJUSTMENT'>('GENERAL');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', accountName: '', debit: 0, credit: 0, description: '' },
    { accountId: '', accountName: '', debit: 0, credit: 0, description: '' },
  ]);
  const [accountSearches, setAccountSearches] = useState<Record<number, { query: string; results: any[]; open: boolean }>>({});

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const canSubmit = lines.every((l) => l.accountId) && lines.some((l) => l.debit > 0 || l.credit > 0) && isBalanced;

  const searchAccount = async (idx: number, q: string) => {
    setAccountSearches((prev) => ({ ...prev, [idx]: { ...prev[idx], query: q, open: q.length >= 1 } }));
    if (q.length < 1) return;
    try {
      const res = await api.get('/accounts', { params: { search: q, limit: 10 } });
      setAccountSearches((prev) => ({
        ...prev,
        [idx]: { ...prev[idx], results: res.data.data || [], open: true },
      }));
    } catch {}
  };

  const selectAccount = (idx: number, account: any) => {
    const newLines = lines.map((l, i) =>
      i === idx ? { ...l, accountId: account.id, accountName: `${account.code} - ${account.name}` } : l
    );
    setLines(newLines);
    setAccountSearches((prev) => ({ ...prev, [idx]: { ...prev[idx], open: false } }));
  };

  const addLine = () => {
    setLines([...lines, { accountId: '', accountName: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length > 2) setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: string, value: any) => {
    setLines(lines.map((l, i) => (i !== idx ? l : { ...l, [field]: value })));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setError('');
      const res = await api.post('/journal-entries', {
        date,
        type: type === 'GENERAL' ? undefined : type,
        description: description || undefined,
        items: lines.map((l) => ({
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description || undefined,
        })),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create journal entry';
      setError(msg);
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'GENERAL' | 'ADJUSTMENT')}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="GENERAL">General Entry</option>
            <option value="ADJUSTMENT">Adjustment Entry</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Journal Lines (min 2, Debit = Credit)</label>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="h-3 w-3 mr-1" /> Add Line
          </Button>
        </div>

        {lines.map((line, idx) => (
          <div key={idx} className="flex gap-2 items-start border rounded-lg p-3 bg-muted/30">
            <div className="flex-1 space-y-1">
              <div className="relative">
                <Input
                  placeholder="Search account..."
                  value={accountSearches[idx]?.query || line.accountName}
                  onChange={(e) => { setLines(lines.map((l, i) => i === idx ? { ...l, accountName: e.target.value, accountId: '' } : l)); searchAccount(idx, e.target.value); }}
                  onFocus={() => {
                    const sq = accountSearches[idx];
                    if (sq?.results?.length > 0) setAccountSearches((prev) => ({ ...prev, [idx]: { ...prev[idx], open: true } }));
                  }}
                  className="h-8 text-xs"
                />
                {accountSearches[idx]?.open && (accountSearches[idx]?.results?.length > 0) && (
                  <div className="absolute z-10 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-40 overflow-y-auto">
                    {accountSearches[idx].results.map((a: any) => (
                      <button
                        key={a.id}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent"
                        onClick={() => selectAccount(idx, a)}
                      >
                        <span className="font-mono">{a.code}</span> - {a.name}
                        <span className="text-muted-foreground ml-1">({a.type})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input
                placeholder="Line description"
                value={line.description}
                onChange={(e) => updateLine(idx, 'description', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Input
              type="number"
              placeholder="Debit"
              value={line.debit || ''}
              onChange={(e) => updateLine(idx, 'debit', parseFloat(e.target.value) || 0)}
              className="w-24 h-8 text-xs text-right"
            />
            <Input
              type="number"
              placeholder="Credit"
              value={line.credit || ''}
              onChange={(e) => updateLine(idx, 'credit', parseFloat(e.target.value) || 0)}
              className="w-24 h-8 text-xs text-right"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(idx)} disabled={lines.length <= 2}>
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Total Debit</span>
          <span className={totalDebit === totalCredit ? 'font-bold text-green-600' : 'font-bold text-destructive'}>
            Rp {totalDebit.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Credit</span>
          <span className={totalDebit === totalCredit ? 'font-bold text-green-600' : 'font-bold text-destructive'}>
            Rp {totalCredit.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Balance</span>
          <span className={isBalanced ? 'text-green-600' : 'text-destructive'}>
            {isBalanced ? 'Balanced ✓' : `Difference: Rp ${Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !canSubmit}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Create Journal Entry
        </Button>
      </div>
    </div>
  );
}
