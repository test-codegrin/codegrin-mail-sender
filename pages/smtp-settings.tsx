import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Settings, FileText, LogOut, Send, Trash2 } from 'lucide-react';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function SMTPSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [smtp, setSmtp] = useState<SMTPConfig>({
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromName: '',
    fromEmail: '',
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchSMTPConfig();
    fetchTemplates();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchSMTPConfig = async () => {
    try {
      const res = await fetch('/api/smtp', {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      const data = await res.json();
      if (data.smtp) {
        setSmtp(data.smtp);
      }
    } catch (err: any) {
      setError('Failed to fetch SMTP configuration');
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/smtp', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(smtp),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save SMTP configuration');
      }

      setMessage('SMTP configuration saved successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setError('');
    setMessage('');
    setTestLoading(true);

    try {
      const res = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      setMessage('SMTP connection successful!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTemplate),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create template');
      }

      setMessage('Template created successfully');
      setNewTemplate({ name: '', subject: '', body: '' });
      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Failed to delete template');
      }

      setMessage('Template deleted successfully');
      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Mail Admin</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/compose')} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Compose
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
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

        <Tabs defaultValue="smtp" className="space-y-4">
          <TabsList>
            <TabsTrigger value="smtp">
              <Settings className="h-4 w-4 mr-2" />
              SMTP Settings
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smtp">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>
                  Configure your SMTP server settings for sending emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSMTP} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="host">SMTP Host</Label>
                      <Input
                        id="host"
                        placeholder="smtp.gmail.com"
                        value={smtp.host}
                        onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder="587"
                        value={smtp.port}
                        onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="secure"
                      checked={smtp.secure}
                      onCheckedChange={(checked) => setSmtp({ ...smtp, secure: checked })}
                    />
                    <Label htmlFor="secure">Use SSL/TLS</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Username</Label>
                      <Input
                        id="user"
                        placeholder="your-email@gmail.com"
                        value={smtp.user}
                        onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={smtp.password}
                        onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        placeholder="Your Company"
                        value={smtp.fromName}
                        onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="noreply@example.com"
                        value={smtp.fromEmail}
                        onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testLoading}
                    >
                      {testLoading ? 'Testing...' : 'Test Connection'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Template</CardTitle>
                  <CardDescription>
                    Create reusable email templates for quick sending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        placeholder="Welcome Email"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateSubject">Subject</Label>
                      <Input
                        id="templateSubject"
                        placeholder="Welcome to our service!"
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateBody">Body (HTML)</Label>
                      <Textarea
                        id="templateBody"
                        placeholder="<h1>Welcome!</h1><p>Thank you for joining us.</p>"
                        rows={6}
                        value={newTemplate.body}
                        onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit">Create Template</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Templates</CardTitle>
                  <CardDescription>
                    {templates.length} template{templates.length !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {templates.length === 0 ? (
                    <p className="text-sm text-slate-500">No templates yet. Create one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{template.name}</h3>
                              <p className="text-sm text-slate-600 mt-1">{template.subject}</p>
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                {template.body.replace(/<[^>]*>/g, '')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
