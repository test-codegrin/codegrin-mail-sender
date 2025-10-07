import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, saveStore } from '@/lib/store';
import { withAuth } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const store = await getStore();

      if (!store.smtp) {
        return res.status(200).json({ smtp: null });
      }

      const maskedSMTP = {
        ...store.smtp,
        password: store.smtp.password ? '********' : '',
      };

      res.status(200).json({ smtp: maskedSMTP });
    } catch (error) {
      console.error('Get SMTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { host, port, secure, user, password, fromName, fromEmail } = req.body;

      if (!host || !port || user === undefined || !fromEmail) {
        return res.status(400).json({ error: 'Missing required SMTP fields' });
      }

      const store = await getStore();

      store.smtp = {
        host,
        port: parseInt(port),
        secure: Boolean(secure),
        user,
        password: password || '',
        fromName: fromName || '',
        fromEmail,
      };

      await saveStore(store);

      res.status(200).json({ message: 'SMTP configuration saved successfully' });
    } catch (error) {
      console.error('Save SMTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
