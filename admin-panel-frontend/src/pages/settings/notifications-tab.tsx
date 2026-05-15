import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const NotificationsTab: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const notificationTypes = [
    { id: 'user_created', label: 'New user registration', email: true, inApp: true },
    { id: 'order_placed', label: 'New order placed', email: true, inApp: true },
    { id: 'payment_received', label: 'Payment received', email: false, inApp: true },
    { id: 'system_alert', label: 'System alerts', email: true, inApp: true },
  ];

  const handleSave = () => {
    toast.success('Notification settings saved');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure which events trigger email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Enable Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                emailNotifications ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {notificationTypes.map((type) => (
            <label key={type.id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">{type.label}</span>
              <input type="checkbox" className="rounded" defaultChecked={type.email} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>Configure in-app notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Enable In-App Notifications</p>
              <p className="text-sm text-muted-foreground">Show notifications in the application</p>
            </div>
            <button
              onClick={() => setInAppNotifications(!inAppNotifications)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                inAppNotifications ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {notificationTypes.map((type) => (
            <label key={type.id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm">{type.label}</span>
              <input type="checkbox" className="rounded" defaultChecked={type.inApp} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>Send notifications to Slack channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Slack Webhook URL</label>
            <Input
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
            <p className="text-xs text-muted-foreground">
              Get your webhook URL from Slack's incoming webhooks integration
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Webhook</CardTitle>
          <CardDescription>Send notifications to a custom endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook URL</label>
            <Input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              POST requests will be sent to this URL with notification data
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default NotificationsTab;
