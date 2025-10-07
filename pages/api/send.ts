import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { getStore } from '@/lib/store';
import { withAuth } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body, replyTo } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    const store = await getStore();

    if (!store.smtp) {
      return res.status(400).json({ error: 'SMTP configuration not found. Please configure SMTP settings first.' });
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

    const mailOptions = {
      from: store.smtp.fromName
        ? `"${store.smtp.fromName}" <${store.smtp.fromEmail}>`
        : store.smtp.fromEmail,
      to,
      subject,
      html: body,
      replyTo: replyTo || store.smtp.fromEmail,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Send email error:', error);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
}

export default withAuth(handler);
