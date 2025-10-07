'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, ArrowLeft, Send } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function ComposePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: '',
    replyTo: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchTemplates();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (templateId === 'none') {
      setEmail({ ...email, subject: '', body: '' });
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setEmail({
        ...email,
        subject: template.subject,
        body: template.body,
      });
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(email),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setMessage('Email sent successfully!');
      setEmail({ to: '', subject: '', body: '', replyTo: '' });
      setSelectedTemplateId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Compose Email</h1>
          </div>
          <Button onClick={() => router.push('/smtp-settings')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </div>

        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
            <CardDescription>
              Compose and send an email using your configured SMTP settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              {templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Template</Label>
                  <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={email.to}
                  onChange={(e) => setEmail({ ...email, to: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To (optional)</Label>
                <Input
                  id="replyTo"
                  type="email"
                  placeholder="reply@example.com"
                  value={email.replyTo}
                  onChange={(e) => setEmail({ ...email, replyTo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message (HTML supported)</Label>
                <Textarea
                  id="body"
                  placeholder="<p>Hello,</p><p>Your email content here...</p>"
                  rows={12}
                  value={email.body}
                  onChange={(e) => setEmail({ ...email, body: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
