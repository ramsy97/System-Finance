'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogClose } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'SALES' | 'PURCHASE'>('SALES');
  const [contactId, setContactId] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const searchContacts = async (q: string) => {
    setContactSearch(q);
    if (q.length < 2) return;
    try {
      const res = await api.get('/contacts', { params: { search: q, limit: 10 } });
      setContacts(res.data.data || []);
      setShowContacts(true);
    } catch { }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = items.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (field === 'quantity' ? value : item.quantity) * (field === 'unitPrice' ? value : item.unitPrice);
      }
      return updated;
    });
    setItems(newItems);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setError('');
      const res = await api.post('/invoices', {
        type,
        contactId,
        date,
        dueDate,
        subtotal,
        taxAmount: tax,
        discountAmount: 0,
        totalAmount: total,
        notes: notes || undefined,
        items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, amount: i.amount })),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create invoice';
      setError(msg);
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'SALES' | 'PURCHASE')}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="SALES">Sales Invoice</option>
            <option value="PURCHASE">Purchase Invoice</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact</label>
          <div className="relative">
            <Input
              placeholder="Search contact..."
              value={contactSearch}
              onChange={(e) => searchContacts(e.target.value)}
              onFocus={() => contacts.length > 0 && setShowContacts(true)}
            />
            {showContacts && contacts.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-40 overflow-y-auto">
                {contacts.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => { setContactId(c.id); setContactSearch(c.name); setShowContacts(false); }}
                  >
                    {c.name} <span className="text-muted-foreground">({c.type})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Issue Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Items</label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
              className="w-16"
            />
            <Input
              type="number"
              placeholder="Price"
              value={item.unitPrice}
              onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
              className="w-28"
            />
            <div className="w-28 py-2 text-sm text-right font-medium">
              {item.amount.toLocaleString('id-ID')}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length === 1}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between"><span>PPN (11%)</span><span>Rp {tax.toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between font-bold text-base"><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
        />
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
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !contactId || !dueDate}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
