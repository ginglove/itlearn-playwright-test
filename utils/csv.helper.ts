import fs from 'fs';

export interface RegisterTestCase {
  testCaseId: string;
  description: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: string;
  otp: string;
  status?: string;
}
export async function readCsv(filePath: string): Promise<RegisterTestCase[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  const records: RegisterTestCase[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ? values[index].trim() : '';
    });
    records.push(record as RegisterTestCase);
  }

  return records;
}
export async function updateTestCaseStatus(
  filePath: string,
  testCaseId: string,
  status: 'PASS' | 'FAIL'
): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = content.split(/\r?\n/);
  const updatedLines = lines.map(line => {
    if (line.startsWith(testCaseId + ',')) {
      const columns = line.split(',');
      columns[columns.length - 1] = status; // Cột cuối cùng là cột status
      return columns.join(',');
    }
    return line;
  });
  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf-8');
}
