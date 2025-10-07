import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface User {
  email: string;
  passwordHash: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface Store {
  user: User;
  smtp: SMTPConfig | null;
  templates: Template[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function initializeStore(): Promise<Store> {
  ensureDataDir();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const initialStore: Store = {
    user: {
      email: adminEmail,
      passwordHash,
    },
    smtp: null,
    templates: [],
  };

  fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2));
  return initialStore;
}

export async function getStore(): Promise<Store> {
  ensureDataDir();

  if (!fs.existsSync(STORE_FILE)) {
    return await initializeStore();
  }

  const data = fs.readFileSync(STORE_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function saveStore(store: Store): Promise<void> {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}
