import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import apiClient from '../../lib/apiClient';
import { Loader2 } from 'lucide-react';

type SecurityValues = {
  minPasswordLength: number;
  requireUpperNumber: boolean;
  requireSpecial: boolean;
  idleTimeoutMinutes: string;
  enforce2fa: boolean;
};

const DEFAULTS: SecurityValues = {
  minPasswordLength: 12,
  requireUpperNumber: true,
  requireSpecial: true,
  idleTimeoutMinutes: '30',
  enforce2fa: false,
};

export default function SecuritySettingsView() {
  const [values, setValues] = useState<SecurityValues>(DEFAULTS);
  const [baseline, setBaseline] = useState<SecurityValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/users/settings');
        const raw = res.data?.data || {};
        const section = raw['settings.security'] ?? raw.security;
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
      await apiClient.put('/users/settings', { section: 'security', values });
      setBaseline(values);
      setMessage('Security settings saved. (Clerk still enforces real auth/2FA rules.)');
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
        <h3 className="text-lg font-medium">Security & Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Manage password policies, session timeouts, and two-factor authentication preferences.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Documented policy for the org. Clerk Dashboard is source of truth for password rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minLength">Minimum Password Length</Label>
            <Input
              id="minLength"
              type="number"
              min={8}
              max={128}
              value={values.minPasswordLength}
              onChange={(e) =>
                setValues((v) => ({ ...v, minPasswordLength: Number(e.target.value) || 8 }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Require Uppercase & Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must contain at least one uppercase letter and one number.
              </p>
            </div>
            <Switch
              checked={values.requireUpperNumber}
              onCheckedChange={(requireUpperNumber) =>
                setValues((v) => ({ ...v, requireUpperNumber }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must contain at least one symbol (e.g., @, #, $, %).
              </p>
            </div>
            <Switch
              checked={values.requireSpecial}
              onCheckedChange={(requireSpecial) => setValues((v) => ({ ...v, requireSpecial }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Configure how long administrators can stay logged in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Idle Session Timeout</Label>
            <Select
              value={values.idleTimeoutMinutes}
              onValueChange={(idleTimeoutMinutes) =>
                setValues((v) => ({ ...v, idleTimeoutMinutes }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minutes</SelectItem>
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="60">1 Hour</SelectItem>
                <SelectItem value="240">4 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription>Preference flag — enable 2FA enforcement in Clerk Dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enforce 2FA for Admins</Label>
              <p className="text-sm text-muted-foreground">
                Track whether org policy requires 2FA for admin accounts.
              </p>
            </div>
            <Switch
              checked={values.enforce2fa}
              onCheckedChange={(enforce2fa) => setValues((v) => ({ ...v, enforce2fa }))}
            />
          </div>
        </CardContent>
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

      <div className="flex justify-end gap-4 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setValues(baseline);
            setMessage(null);
            setError(null);
          }}
          disabled={saving}
        >
          Discard
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} /> Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
