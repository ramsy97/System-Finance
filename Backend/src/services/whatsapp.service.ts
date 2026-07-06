import prisma from '../config/database';

export async function sendWhatsApp(phone: string, message: string) {
  try {
    const settings = await prisma.companySettings.findUnique({ where: { id: 'default' } });
    if (!settings?.waApiUrl || !settings?.waApiKey) {
      console.warn('WhatsApp API not configured. Message not sent.');
      return;
    }
    const url = `${settings.waApiUrl}/send-message`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': settings.waApiKey },
      body: JSON.stringify({ phone, message }),
    });
    if (!response.ok) throw new Error(`WhatsApp API error: ${response.statusText}`);
    console.log(`WhatsApp sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send WhatsApp:', error);
  }
}

export async function sendInvoiceWhatsApp(invoice: any) {
  if (!invoice.contact?.phone) return;
  const message = `Dear ${invoice.contact.name},\n\nInvoice ${invoice.invoiceNumber} has been issued.\nAmount: Rp ${Number(invoice.totalAmount).toLocaleString('id-ID')}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString('id-ID')}\n\nThank you.`;
  await sendWhatsApp(invoice.contact.phone, message);
}
