import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import apiClient from '../../lib/apiClient';
import { Loader2 } from 'lucide-react';

type IntegrationValues = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  googleSso: boolean;
  microsoftSso: boolean;
};

const DEFAULTS: IntegrationValues = {
  smtpHost: 'smtp.mailgun.org',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  fromEmail: 'noreply@cadt.edu.kh',
  googleSso: true,
  microsoftSso: false,
};

export default function IntegrationsView() {
  const [values, setValues] = useState<IntegrationValues>(DEFAULTS);
  const [baseline, setBaseline] = useState<IntegrationValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/users/settings');
        const raw = res.data?.data || {};
        const section = raw['settings.integrations'] ?? raw.integrations;
        if (section && typeof section === 'object') {
          const merged = { ...DEFAULTS, ...section };
          setValues(merged);
          setBaseline(merged);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Never store empty password overwrite if user left blank
      const payload = {
        ...values,
        smtpPass: values.smtpPass || baseline.smtpPass || '',
      };
      await apiClient.put('/users/settings', { section: 'integrations', values: payload });
      setBaseline(payload);
      setValues((v) => ({ ...v, smtpPass: '' })); // clear password field after save
      setMessage('Integration settings saved to the database.');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-12">
        <Loader2 className="animate-spin" size={18} /> Loading settings…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Integrations & API</h3>
        <p className="text-sm text-muted-foreground">
          Manage connection preferences. Runtime secrets (Cloudinary, Telegram, Clerk) still use
          server environment variables.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>SMTP Email Server</CardTitle>
          <CardDescription>
            Configure the mail server used for system notifications and invites (stored for ops).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={values.smtpHost}
                onChange={(e) => setValues((v) => ({ ...v, smtpHost: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={values.smtpPort}
                onChange={(e) =>
                  setValues((v) => ({ ...v, smtpPort: Number(e.target.value) || 587 }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input
              id="smtpUser"
              value={values.smtpUser}
              onChange={(e) => setValues((v) => ({ ...v, smtpUser: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">SMTP Password</Label>
            <Input
              id="smtpPass"
              type="password"
              placeholder={baseline.smtpPass ? '•••••••• (leave blank to keep)' : '••••••••••••••••'}
              value={values.smtpPass}
              onChange={(e) => setValues((v) => ({ ...v, smtpPass: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">&quot;From&quot; Email Address</Label>
            <Input
              id="fromEmail"
              type="email"
              value={values.fromEmail}
              onChange={(e) => setValues((v) => ({ ...v, fromEmail: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              setMessage(
                values.smtpHost
                  ? `SMTP host set to ${values.smtpHost}:${values.smtpPort}. Full connect test needs a mail worker.`
                  : 'Enter SMTP host first.'
              )
            }
          >
            Test Connection
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} /> Saving…
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On (SSO)</CardTitle>
          <CardDescription>
            Track which providers your org uses. Enable providers in the Clerk Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Google Workspace SSO</Label>
              <p className="text-sm text-muted-foreground">
                Login via Google (e.g. @cadt.edu.kh).
              </p>
            </div>
            <Switch
              checked={values.googleSso}
              onCheckedChange={(googleSso) => setValues((v) => ({ ...v, googleSso }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Microsoft Entra ID (Azure AD)</Label>
              <p className="text-sm text-muted-foreground">
                Login via Microsoft institutional accounts.
              </p>
            </div>
            <Switch
              checked={values.microsoftSso}
              onCheckedChange={(microsoftSso) => setValues((v) => ({ ...v, microsoftSso }))}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>

      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
