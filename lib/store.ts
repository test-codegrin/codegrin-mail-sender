import { hashPassword } from './crypto';

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

let globalStore: Store | null = null;

async function initializeStore(): Promise<Store> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  const passwordHash = await hashPassword(adminPassword);

  const initialStore: Store = {
    user: {
      email: adminEmail,
      passwordHash,
    },
    smtp: null,
    templates: [],
  };

  globalStore = initialStore;
  return initialStore;
}

export async function getStore(): Promise<Store> {
  if (!globalStore) {
    return await initializeStore();
  }
  return globalStore;
}

export async function saveStore(store: Store): Promise<void> {
  globalStore = store;
}
