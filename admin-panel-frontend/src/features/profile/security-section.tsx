import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Monitor, Globe, LogOut, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export const SecuritySection: React.FC = () => {
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      ip: '192.168.1.1',
      lastActive: '2 minutes ago',
      current: true,
      icon: Globe,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      ip: '192.168.1.2',
      lastActive: '1 hour ago',
      current: false,
      icon: Smartphone,
    },
    {
      id: '3',
      device: 'Firefox on MacOS',
      location: 'San Francisco, USA',
      ip: '192.168.1.3',
      lastActive: '2 days ago',
      current: false,
      icon: Monitor,
    },
  ];

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    // API call to change password
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnableMfa = () => {
    setMfaEnabled(true);
    setShowMfaSetup(false);
    toast.success('Two-factor authentication enabled');
  };

  const handleRevokeSession = (sessionId: string) => {
    toast.success('Session revoked successfully');
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleChangePassword}>Change Password</Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
            {mfaEnabled && (
              <Badge variant="success">
                <Check className="mr-1 h-3 w-3" />
                Enabled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mfaEnabled && !showMfaSetup && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication adds an additional layer of security to your account by
                requiring more than just a password to sign in.
              </p>
              <Button onClick={() => setShowMfaSetup(true)}>
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            </div>
          )}

          {showMfaSetup && !mfaEnabled && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">Step 1: Scan QR Code</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value="otpauth://totp/AdminPanel:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AdminPanel" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Or enter this code manually: <code className="font-mono">JBSWY3DPEHPK3PXP</code>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Step 2: Enter Verification Code</label>
                <Input placeholder="Enter 6-digit code" maxLength={6} />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEnableMfa}>Verify & Enable</Button>
                <Button variant="outline" onClick={() => setShowMfaSetup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Two-factor authentication is enabled</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with 2FA
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMfaEnabled(false);
                    toast.success('Two-factor authentication disabled');
                  }}
                >
                  Disable
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices where you're currently signed in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => {
              const Icon = session.icon;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • {session.ip}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
