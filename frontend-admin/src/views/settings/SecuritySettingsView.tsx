import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';

export default function SecuritySettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Security & Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Manage password policies, session timeouts, and two-factor authentication.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Enforce strong passwords for all administrator accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minLength">Minimum Password Length</Label>
            <Input id="minLength" type="number" defaultValue={12} min={8} max={128} />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Require Uppercase & Numbers</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must contain at least one uppercase letter and one number.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">
                Passwords must contain at least one symbol (e.g., @, #, $, %).
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Configure how long administrators can stay logged in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Idle Session Timeout</Label>
            <Select defaultValue="30">
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
            <p className="text-sm text-muted-foreground">
              Users will be automatically logged out after this period of inactivity.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription>
            Add an extra layer of security to administrator accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enforce 2FA for Admins</Label>
              <p className="text-sm text-muted-foreground">
                Require all admin users to set up 2FA before they can access the dashboard.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-4">
        <Button variant="outline">Discard</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
