import { PrismaClient, Role, AccountType, ContactType, InvoiceType, InvoiceStatus, TransactionType, PaymentMethod, ApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  console.log('Seeding database...');

  await prisma.$transaction([
    prisma.bankMutation.deleteMany(),
    prisma.journalItem.deleteMany(),
    prisma.journalEntry.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.budget.deleteMany(),
    prisma.bankKas.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.account.deleteMany(),
    prisma.project.deleteMany(),
    prisma.department.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
    prisma.companySettings.deleteMany(),
  ]);

  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@finance.com', password: hashedPassword, name: 'Budi Santoso', role: 'SUPER_ADMIN' as Role } }),
    prisma.user.create({ data: { email: 'finance@finance.com', password: hashedPassword, name: 'Siti Rahayu', role: 'FINANCE' as Role } }),
    prisma.user.create({ data: { email: 'accounting@finance.com', password: hashedPassword, name: 'Agus Wijaya', role: 'ACCOUNTING' as Role } }),
    prisma.user.create({ data: { email: 'manager@finance.com', password: hashedPassword, name: 'Dewi Lestari', role: 'MANAGER' as Role } }),
    prisma.user.create({ data: { email: 'viewer@finance.com', password: hashedPassword, name: 'Rudi Hartono', role: 'VIEWER' as Role } }),
  ]);
  console.log(`Created ${users.length} users`);

  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'IT Department', code: 'IT' } }),
    prisma.department.create({ data: { name: 'Marketing', code: 'MKT' } }),
    prisma.department.create({ data: { name: 'Finance', code: 'FIN' } }),
    prisma.department.create({ data: { name: 'Operations', code: 'OPS' } }),
    prisma.department.create({ data: { name: 'HR & GA', code: 'HRGA' } }),
  ]);
  console.log(`Created ${departments.length} departments`);

  const projects = await Promise.all([
    prisma.project.create({ data: { name: 'ERP Implementation', code: 'ERP-2024', budget: 500000000 } }),
    prisma.project.create({ data: { name: 'Office Renovation', code: 'OR-2024', budget: 200000000 } }),
    prisma.project.create({ data: { name: 'Digital Marketing', code: 'DM-2024', budget: 150000000 } }),
    prisma.project.create({ data: { name: 'Staff Training', code: 'ST-2024', budget: 75000000 } }),
  ]);
  console.log(`Created ${projects.length} projects`);

  const accountData = [
    { code: '1110', name: 'Cash on Hand', type: 'ASSET' as AccountType },
    { code: '1120', name: 'Bank BCA', type: 'ASSET' as AccountType },
    { code: '1121', name: 'Bank Mandiri', type: 'ASSET' as AccountType },
    { code: '1122', name: 'Bank BRI', type: 'ASSET' as AccountType },
    { code: '1130', name: 'Accounts Receivable', type: 'ASSET' as AccountType },
    { code: '1140', name: 'Inventory', type: 'ASSET' as AccountType },
    { code: '1150', name: 'Prepaid Expenses', type: 'ASSET' as AccountType },
    { code: '1210', name: 'Office Equipment', type: 'ASSET' as AccountType },
    { code: '1220', name: 'Accum. Depreciation - Equipment', type: 'ASSET' as AccountType },
    { code: '2110', name: 'Accounts Payable', type: 'LIABILITY' as AccountType },
    { code: '2120', name: 'Tax Payable (PPN)', type: 'LIABILITY' as AccountType },
    { code: '2130', name: 'Accrued Expenses', type: 'LIABILITY' as AccountType },
    { code: '2140', name: 'Bank Loan', type: 'LIABILITY' as AccountType },
    { code: '3110', name: 'Owner Equity', type: 'EQUITY' as AccountType },
    { code: '3120', name: 'Retained Earnings', type: 'EQUITY' as AccountType },
    { code: '4110', name: 'Product Sales Revenue', type: 'REVENUE' as AccountType },
    { code: '4120', name: 'Service Revenue', type: 'REVENUE' as AccountType },
    { code: '4130', name: 'Other Income', type: 'REVENUE' as AccountType },
    { code: '5110', name: 'Cost of Goods Sold', type: 'EXPENSE' as AccountType },
    { code: '5120', name: 'Salary Expense', type: 'EXPENSE' as AccountType },
    { code: '5130', name: 'Rent Expense', type: 'EXPENSE' as AccountType },
    { code: '5140', name: 'Utilities Expense', type: 'EXPENSE' as AccountType },
    { code: '5150', name: 'Marketing Expense', type: 'EXPENSE' as AccountType },
    { code: '5160', name: 'Office Supplies Expense', type: 'EXPENSE' as AccountType },
    { code: '5170', name: 'Travel Expense', type: 'EXPENSE' as AccountType },
    { code: '5180', name: 'Depreciation Expense', type: 'EXPENSE' as AccountType },
    { code: '5190', name: 'Tax Expense', type: 'EXPENSE' as AccountType },
    { code: '5200', name: 'Other Expense', type: 'EXPENSE' as AccountType },
  ];

  const accounts = await Promise.all(
    accountData.map((a) => prisma.account.create({
      data: { code: a.code, name: a.name, type: a.type, balance: a.type === 'ASSET' ? randomDecimal(10000000, 500000000) : randomDecimal(0, 100000000), isSystem: ['1110', '1120', '1130', '3110'].includes(a.code) },
    }))
  );
  console.log(`Created ${accounts.length} accounts`);

  const bankAccounts = await Promise.all([
    prisma.bankKas.create({ data: { accountId: accounts[1].id, bankName: 'BCA', accountNumber: '1234567890', holderName: 'PT Fintech Corp' } }),
    prisma.bankKas.create({ data: { accountId: accounts[2].id, bankName: 'Bank Mandiri', accountNumber: '9876543210', holderName: 'PT Fintech Corp' } }),
    prisma.bankKas.create({ data: { accountId: accounts[0].id, bankName: 'Cash', accountNumber: '-', holderName: 'Petty Cash' } }),
  ]);
  console.log(`Created ${bankAccounts.length} bank/cash accounts`);

  const contactNames = [
    { name: 'PT Maju Bersama', type: 'CUSTOMER' as ContactType, email: 'info@majubersama.com' },
    { name: 'CV Sejahtera Abadi', type: 'CUSTOMER' as ContactType, email: 'admin@sejahteraabadi.com' },
    { name: 'PT Teknologi Nusantara', type: 'CUSTOMER' as ContactType, email: 'contact@teknus.com' },
    { name: 'CV Karya Mandiri', type: 'CUSTOMER' as ContactType, email: 'info@karyamandiri.com' },
    { name: 'PT Bumi Persada', type: 'CUSTOMER' as ContactType, email: 'admin@bumipersada.com' },
    { name: 'UD Sumber Rejeki', type: 'CUSTOMER' as ContactType, email: 'sumber@rejeki.com' },
    { name: 'PT Indah Logistik', type: 'SUPPLIER' as ContactType, email: 'info@indahlogistik.com' },
    { name: 'CV Bahan Bangunan', type: 'SUPPLIER' as ContactType, email: 'sales@bahanbangunan.com' },
    { name: 'PT Alat Kantor Sejahtera', type: 'SUPPLIER' as ContactType, email: 'order@alatkantor.com' },
    { name: 'CV Teknik Utama', type: 'SUPPLIER' as ContactType, email: 'info@teknikutama.com' },
    { name: 'PT Konsultan Bisnis', type: 'VENDOR' as ContactType, email: 'contact@konsultanbisnis.com' },
    { name: 'CV Digital Solusi', type: 'VENDOR' as ContactType, email: 'info@digitalsolusi.com' },
    { name: 'PT Media Promosi', type: 'VENDOR' as ContactType, email: 'sales@mediapromosi.com' },
    { name: 'UD Elektronik Jaya', type: 'SUPPLIER' as ContactType, email: 'elektronik@jaya.com' },
    { name: 'PT Transportasi Logistik', type: 'SUPPLIER' as ContactType, email: 'logistik@transport.com' },
  ];

  const customers = await Promise.all(
    contactNames.map((c) => prisma.contact.create({
      data: { ...c, phone: `0812${randomInt(1000000, 9999999)}`, address: `Jl. Contoh No. ${randomInt(1, 100)}, Jakarta`, taxId: `${randomInt(100000000, 999999999)}` },
    }))
  );
  console.log(`Created ${customers.length} contacts`);

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Sales Revenue', type: 'REVENUE' as AccountType } }),
    prisma.category.create({ data: { name: 'Service Income', type: 'REVENUE' as AccountType } }),
    prisma.category.create({ data: { name: 'Cost of Sales', type: 'EXPENSE' as AccountType } }),
    prisma.category.create({ data: { name: 'Operational Expenses', type: 'EXPENSE' as AccountType } }),
    prisma.category.create({ data: { name: 'Marketing Expenses', type: 'EXPENSE' as AccountType } }),
    prisma.category.create({ data: { name: 'Administrative Expenses', type: 'EXPENSE' as AccountType } }),
    prisma.category.create({ data: { name: 'Tax Expenses', type: 'EXPENSE' as AccountType } }),
  ]);
  console.log(`Created ${categories.length} categories`);

  for (const dept of departments) {
    for (const cat of categories) {
      await prisma.budget.create({
        data: { year: 2024, amount: randomDecimal(10000000, 100000000), categoryId: cat.id, departmentId: dept.id },
      });
    }
  }
  console.log('Created budgets');

  for (let i = 0; i < 20; i++) {
    await prisma.budget.create({
      data: { year: 2024, month: randomInt(1, 12), amount: randomDecimal(5000000, 50000000), categoryId: randomElement(categories).id, projectId: randomElement(projects).id },
    });
  }
  console.log('Created monthly budgets');

  const itemDescriptions = ['Software License', 'Consulting Service', 'Office Furniture', 'Web Development', 'Design Service', 'Annual Maintenance', 'Cloud Subscription', 'Marketing Package', 'Training Module', 'Hardware Equipment'];

  for (let i = 0; i < 100; i++) {
    const isSales = Math.random() > 0.4;
    const contact: any = randomElement(customers);
    const date = addDays(new Date('2024-01-01'), randomInt(0, 365));
    const dueDate = addDays(date, randomInt(14, 60));
    const itemsCount = randomInt(1, 4);
    const items = Array.from({ length: itemsCount }, () => {
      const qty = randomInt(1, 10);
      const unitPrice = randomDecimal(100000, 5000000);
      return { description: randomElement(itemDescriptions), quantity: qty, unitPrice, amount: qty * unitPrice };
    });
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = Math.random() > 0.7 ? randomDecimal(0, subtotal * 0.1) : 0;
    const taxAmount = (subtotal - discountAmount) * 0.11;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const statusWeights: InvoiceStatus[] = [];
    const weight = Math.random();
    if (weight < 0.3) statusWeights.push('PAID');
    else if (weight < 0.5) statusWeights.push('SENT');
    else if (weight < 0.65) statusWeights.push('PARTIALLY_PAID');
    else if (weight < 0.8) statusWeights.push('OVERDUE');
    else if (weight < 0.9) statusWeights.push('DRAFT');
    else statusWeights.push('CANCELLED');

    const status = statusWeights[0];
    const amountPaid = status === 'PAID' ? totalAmount : status === 'PARTIALLY_PAID' ? totalAmount * randomDecimal(0.1, 0.9) : 0;

    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2024${String(i + 1).padStart(4, '0')}`,
        type: isSales ? 'SALES' as InvoiceType : 'PURCHASE' as InvoiceType,
        contactId: contact.id,
        date,
        dueDate,
        status,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        amountPaid,
        remainingAmount: totalAmount - amountPaid,
        isRecurring: Math.random() > 0.9,
        approvalStatus: 'APPROVED' as ApprovalStatus,
        approvedById: randomElement(users).id,
        notes: Math.random() > 0.5 ? `Sample invoice notes #${i + 1}` : null,
        items: { create: items },
      },
    });
  }
  console.log('Created 100 invoices');

  const accountIds = accounts.map((a) => a.id);
  const bankAccountIds = bankAccounts.map((b) => b.accountId);
  const revenueAccountIds = [accounts[15].id, accounts[16].id, accounts[17].id];
  const expenseAccountIds = [accounts[21].id, accounts[22].id, accounts[23].id, accounts[24].id, accounts[25].id];

  const transactionDescriptions = [
    'Monthly salary payment', 'Office rent payment', 'Electricity bill', 'Internet subscription',
    'Office supplies purchase', 'Client payment received', 'Service fee income', 'Equipment purchase',
    'Tax payment', 'Travel reimbursement', 'Marketing campaign payment', 'Software subscription',
    'Consulting fee payment', 'Insurance premium', 'Loan payment', 'Dividend payment',
    'Petty cash replenishment', 'Bank transfer to supplier', 'Customer refund', 'Utility bill payment',
  ];

  for (let i = 0; i < 200; i++) {
    const isCashIn = Math.random() > 0.5;
    const date = addDays(new Date('2024-01-01'), randomInt(0, 365));
    const amount = randomDecimal(100000, 50000000);
    const accountId = randomElement(isCashIn ? bankAccountIds : expenseAccountIds);

    await prisma.transaction.create({
      data: {
        transactionNo: `TRX-2024${String(i + 1).padStart(5, '0')}`,
        type: isCashIn ? 'CASH_IN' as TransactionType : 'CASH_OUT' as TransactionType,
        date,
        amount,
        accountId,
        categoryId: randomElement(categories).id,
        contactId: randomElement(customers).id,
        projectId: randomElement(projects).id,
        departmentId: randomElement(departments).id,
        paymentMethod: randomElement(Object.values(PaymentMethod)),
        description: randomElement(transactionDescriptions),
        approvalStatus: Math.random() > 0.2 ? 'APPROVED' as ApprovalStatus : 'PENDING' as ApprovalStatus,
        createdById: randomElement(users).id,
        ...(Math.random() > 0.3 ? { approvedById: randomElement(users).id } : {}),
      },
    });
  }
  console.log('Created 200 transactions');

  for (let i = 0; i < 30; i++) {
    const date = addDays(new Date('2024-01-01'), randomInt(0, 365));
    const itemsCount = randomInt(2, 5);
    const randomAccounts = accounts.sort(() => Math.random() - 0.5).slice(0, itemsCount);
    const totalAmount = randomDecimal(1000000, 50000000);
    let remaining = totalAmount;

    const items = randomAccounts.map((acc, idx) => {
      const isDebit = ['ASSET', 'EXPENSE'].includes(acc.type);
      if (idx === randomAccounts.length - 1) {
        return { accountId: acc.id, debit: isDebit ? remaining : 0, credit: !isDebit ? remaining : 0 };
      }
      const amount = randomDecimal(100000, remaining / 2);
      remaining -= amount;
      return { accountId: acc.id, debit: isDebit ? amount : 0, credit: !isDebit ? amount : 0 };
    });

    await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-2024${String(i + 1).padStart(3, '0')}`,
        date,
        type: i % 5 === 0 ? 'ADJUSTMENT' : 'GENERAL',
        description: `Journal entry #${i + 1}`,
        isSystemGenerated: i % 3 === 0,
        items: { create: items },
      },
    });
  }
  console.log('Created 30 journal entries');

  for (const bank of bankAccounts) {
    for (let i = 0; i < 20; i++) {
      const isDebit = Math.random() > 0.5;
      const amount = randomDecimal(100000, 10000000);
      await prisma.bankMutation.create({
        data: {
          bankKasId: bank.id,
          date: addDays(new Date('2024-01-01'), randomInt(0, 365)),
          amount,
          type: isDebit ? 'DEBIT' : 'CREDIT',
          description: `Bank mutation ${isDebit ? 'inflow' : 'outflow'} #${i + 1}`,
          isReconciled: Math.random() > 0.3,
        },
      });
    }
  }
  console.log('Created bank mutations');

  await prisma.auditLog.create({
    data: { userId: users[0].id, userName: users[0].name, action: 'SYSTEM', entity: 'Seed', details: 'Database seeded with initial data' },
  });

  await prisma.companySettings.create({
    data: {
      id: 'default',
      name: 'PT Fintech Corp',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      taxId: '01.234.567.8-901.000',
      taxRate: 11,
      invoicePrefix: 'INV',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Super Admin: admin@finance.com / password123');
  console.log('  Finance:     finance@finance.com / password123');
  console.log('  Accounting:  accounting@finance.com / password123');
  console.log('  Manager:     manager@finance.com / password123');
  console.log('  Viewer:      viewer@finance.com / password123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
