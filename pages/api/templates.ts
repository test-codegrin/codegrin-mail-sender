import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, saveStore, Template } from '@/lib/store';
import { withAuth } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const store = await getStore();
      res.status(200).json({ templates: store.templates });
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, subject, body } = req.body;

      if (!name || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields: name, subject, body' });
      }

      const store = await getStore();

      const newTemplate: Template = {
        id: Date.now().toString(),
        name,
        subject,
        body,
      };

      store.templates.push(newTemplate);
      await saveStore(store);

      res.status(201).json({ template: newTemplate });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const store = await getStore();
      const index = store.templates.findIndex((t) => t.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Template not found' });
      }

      store.templates.splice(index, 1);
      await saveStore(store);

      res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
