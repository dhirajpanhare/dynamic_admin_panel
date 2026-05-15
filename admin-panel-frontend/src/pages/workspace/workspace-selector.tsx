import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { ROUTES } from '@/config';

const mockWorkspaces = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'Enterprise',
    status: 'Active',
    location: 'San Francisco, CA',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'www.acme.com',
    description: 'Leading provider of innovative solutions',
    logo: '🏢',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    type: 'Startup',
    status: 'Active',
    location: 'Austin, TX',
    email: 'hello@techstart.io',
    phone: '+1 (555) 987-6543',
    website: 'www.techstart.io',
    description: 'Building the future of technology',
    logo: '🚀',
  },
  {
    id: '3',
    name: 'Global Retail Co',
    type: 'Retail',
    status: 'Active',
    location: 'New York, NY',
    email: 'info@globalretail.com',
    phone: '+1 (555) 456-7890',
    website: 'www.globalretail.com',
    description: 'Worldwide retail operations',
    logo: '🛍️',
  },
];

export function WorkspaceSelectorPage() {
  const navigate = useNavigate();
  const { setWorkspace } = useAuthStore();

  const handleSelectWorkspace = (workspace: typeof mockWorkspaces[0]) => {
    setWorkspace({
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      status: workspace.status,
    });
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Select Workspace
          </h1>
          <p className="text-slate-600">
            Choose a workspace to continue
          </p>
        </div>

        {/* Workspace Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectWorkspace(workspace)}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-2xl">
                    {workspace.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {workspace.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {workspace.type}
                    </Badge>
                  </div>
                </div>
                <Badge
                  variant={workspace.status === 'Active' ? 'default' : 'secondary'}
                  className="bg-green-100 text-green-700"
                >
                  {workspace.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600">
                {workspace.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{workspace.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{workspace.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{workspace.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{workspace.website}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Enter Workspace
              </Button>
            </Card>
          ))}
        </div>

        {/* Create New Workspace */}
        <Card className="p-8 text-center space-y-4 border-dashed">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Create New Workspace
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Set up a new workspace for your organization
            </p>
          </div>
          <Button variant="outline">
            Create Workspace
          </Button>
        </Card>
      </div>
    </div>
  );
}
