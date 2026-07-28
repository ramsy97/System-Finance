import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function backupDatabase(outputPath?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const dbUrl = '';
    const match = dbUrl.match(/postgresql:\/\/(\w+):(\w+)@(\w+):(\d+)\/(\w+)/);
    if (!match) {
      reject(new Error('Invalid DATABASE_URL format'));
      return;
    }
    const [, user, password, host, port, database] = match;
    const backupDir = outputPath || path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const filename = path.join(backupDir, `backup_${Date.now()}.sql`);
    const cmd = `set PGPASSWORD=${password} && pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f ${filename}`;
    exec(cmd, (error) => {
      if (error) reject(error);
      else resolve(filename);
    });
  });
}

export function cleanupOldBackups(maxAgeDays: number = 30, backupDir?: string) {
  const dir = backupDir || path.join(__dirname, '../../backups');
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql'));
  const now = Date.now();
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const ageDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > maxAgeDays) fs.unlinkSync(filePath);
  }
}
