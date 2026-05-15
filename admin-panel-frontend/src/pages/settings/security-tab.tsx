import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const SecurityTab: React.FC = () => {
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [loginAttempts, setLoginAttempts] = useState('5');
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState('');

  const handleSave = () => {
    toast.success('Security settings saved');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Configure session timeout and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Timeout (minutes)</label>
            <Input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              placeholder="60"
            />
            <p className="text-xs text-muted-foreground">
              Users will be logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>Set password requirements for all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Password Length</label>
            <Input
              type="number"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(e.target.value)}
              placeholder="8"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Password Requirements</label>
            <div className="space-y-2">
              {[
                'Require uppercase letters',
                'Require lowercase letters',
                'Require numbers',
                'Require special characters',
              ].map((requirement) => (
                <label key={requirement} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">{requirement}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>Enhance security with two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enforce MFA for all users</p>
              <p className="text-sm text-muted-foreground">
                Require all users to set up two-factor authentication
              </p>
            </div>
            <button
              onClick={() => setMfaEnforced(!mfaEnforced)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                mfaEnforced ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  mfaEnforced ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Security</CardTitle>
          <CardDescription>Configure login attempt limits and restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Login Attempts</label>
            <Input
              type="number"
              value={loginAttempts}
              onChange={(e) => setLoginAttempts(e.target.value)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Account will be locked after this many failed attempts
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IP Whitelisting</CardTitle>
          <CardDescription>Restrict access to specific IP addresses (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Allowed IP Addresses</label>
            <textarea
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              placeholder="192.168.1.1&#10;10.0.0.0/24"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Enter one IP address or CIDR range per line. Leave empty to allow all IPs.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Warning</p>
              <p className="text-xs mt-1">
                Be careful when enabling IP whitelisting. You may lock yourself out if configured incorrectly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default SecurityTab;
