import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { getStore } from '@/lib/store';
import { withAuth } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const store = await getStore();

    if (!store.smtp) {
      return res.status(400).json({ error: 'SMTP configuration not found' });
    }

    const transporter = nodemailer.createTransport({
      host: store.smtp.host,
      port: store.smtp.port,
      secure: store.smtp.secure,
      auth: {
        user: store.smtp.user,
        pass: store.smtp.password,
      },
    });

    await transporter.verify();

    res.status(200).json({ message: 'SMTP connection successful' });
  } catch (error: any) {
    console.error('SMTP test error:', error);
    res.status(500).json({ error: `SMTP connection failed: ${error.message}` });
  }
}

export default withAuth(handler);
