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

type GeneralValues = {
  appName: string;
  supportEmail: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
};

const DEFAULTS: GeneralValues = {
  appName: 'CADT Event Platform',
  supportEmail: 'support@cadt.edu.kh',
  timezone: 'asia-phnom-penh',
  language: 'en',
  maintenanceMode: false,
};

export default function GeneralSettingsView() {
  const [values, setValues] = useState<GeneralValues>(DEFAULTS);
  const [baseline, setBaseline] = useState<GeneralValues>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/users/settings');
        const raw = res.data?.data || {};
        const section = raw['settings.general'] ?? raw.general;
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
      await apiClient.put('/users/settings', {
        section: 'general',
        values,
      });
      setBaseline(values);
      setMessage('General settings saved.');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setValues(baseline);
    setMessage(null);
    setError(null);
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
        <h3 className="text-lg font-medium">General Settings</h3>
        <p className="text-sm text-muted-foreground">
          Update the global application settings and localization.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>Basic information about your organization and platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={values.appName}
              onChange={(e) => setValues((v) => ({ ...v, appName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={values.supportEmail}
              onChange={(e) => setValues((v) => ({ ...v, supportEmail: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Used for system-generated support messages when email is connected.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Configure default timezone and language for the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Timezone</Label>
            <Select
              value={values.timezone}
              onValueChange={(timezone) => setValues((v) => ({ ...v, timezone }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asia-phnom-penh">Asia/Phnom Penh (GMT+7)</SelectItem>
                <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                <SelectItem value="america-new_york">America/New_York (EST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Language</Label>
            <Select
              value={values.language}
              onValueChange={(language) => setValues((v) => ({ ...v, language }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="km">Khmer</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>Manage system availability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Flag stored for the platform. Wire student-site banner when you enable this live.
              </p>
            </div>
            <Switch
              checked={values.maintenanceMode}
              onCheckedChange={(maintenanceMode) =>
                setValues((v) => ({ ...v, maintenanceMode }))
              }
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
        <Button variant="outline" onClick={discard} disabled={saving}>
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
