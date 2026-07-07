import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';

export default function IntegrationsView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Integrations & API</h3>
        <p className="text-sm text-muted-foreground">
          Manage connections to third-party services and APIs.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>SMTP Email Server</CardTitle>
          <CardDescription>
            Configure the mail server used for sending system notifications and invites.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" placeholder="smtp.mailgun.org" defaultValue="smtp.mailgun.org" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input id="smtpPort" type="number" placeholder="587" defaultValue={587} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input id="smtpUser" placeholder="postmaster@yourdomain.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">SMTP Password</Label>
            <Input id="smtpPass" type="password" placeholder="••••••••••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">"From" Email Address</Label>
            <Input id="fromEmail" type="email" placeholder="noreply@cadt.edu.kh" defaultValue="noreply@cadt.edu.kh" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Configuration</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Allow users and admins to sign in using third-party providers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Google Workspace SSO</Label>
              <p className="text-sm text-muted-foreground">
                Enable login via Google accounts (restricted to @cadt.edu.kh domain by default).
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Microsoft Entra ID (Azure AD)</Label>
              <p className="text-sm text-muted-foreground">
                Enable login via Microsoft institutional accounts.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
