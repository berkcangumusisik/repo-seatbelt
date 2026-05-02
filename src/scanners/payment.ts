import fg from 'fast-glob';
import { DEFAULT_IGNORED_PATHS } from '../types';

export interface PaymentScanResult {
  hasPaymentFiles: boolean;
  paymentPaths: string[];
  providers: string[];
}

const PAYMENT_PATTERNS = [
  'payment/**',
  '**/payment/**',
  'billing/**',
  '**/billing/**',
  'stripe/**',
  '**/stripe/**',
  '**/*stripe*.ts',
  '**/*stripe*.tsx',
  '**/*stripe*.js',
  '**/*payment*.ts',
  '**/*payment*.tsx',
  '**/*billing*.ts',
  '**/*checkout*.ts',
  '**/*checkout*.tsx',
  '**/*webhook*.ts',
  '**/*webhook*.tsx',
  '**/*iyzico*.*',
  '**/*paytr*.*',
  '**/*moka*.*',
  '**/*paddle*.*',
  '**/*lemonsqueezy*.*',
];

export async function scanPayment(cwd: string): Promise<PaymentScanResult> {
  const files = await fg(PAYMENT_PATTERNS, {
    cwd,
    ignore: DEFAULT_IGNORED_PATHS,
    absolute: false,
  });

  const paymentDirs = new Set<string>();
  const providers: string[] = [];

  for (const file of files) {
    const lower = file.toLowerCase();
    if (lower.includes('stripe') && !providers.includes('Stripe')) providers.push('Stripe');
    if (lower.includes('iyzico') && !providers.includes('İyzico')) providers.push('İyzico');
    if (lower.includes('paytr') && !providers.includes('PayTR')) providers.push('PayTR');
    if (lower.includes('moka') && !providers.includes('Moka')) providers.push('Moka');
    if (lower.includes('paddle') && !providers.includes('Paddle')) providers.push('Paddle');
    if (lower.includes('lemonsqueezy') && !providers.includes('Lemon Squeezy')) providers.push('Lemon Squeezy');

    const parts = file.split('/');
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        if (/payment|billing|stripe|checkout/i.test(parts[i])) {
          paymentDirs.add(parts.slice(0, i + 1).join('/'));
          break;
        }
      }
    } else {
      paymentDirs.add(file);
    }
  }

  return {
    hasPaymentFiles: files.length > 0,
    paymentPaths: [...paymentDirs].slice(0, 5),
    providers,
  };
}
