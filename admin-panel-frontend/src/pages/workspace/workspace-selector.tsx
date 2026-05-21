import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, LogOut } from 'lucide-react';
import { ROUTES } from '@/config';

export function WorkspaceSelectorPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setCurrentTenant } = useTenant();

  // Tenants come from the JWT login response (user.tenants)
  const tenants = user?.tenants ?? [];

  const handleSelectTenant = (tenant: { id: string; name: string; slug: string }) => {
    setCurrentTenant({ id: tenant.id, name: tenant.name, slug: tenant.slug });
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-semibold">
              D
            </div>
            <span className="text-lg font-semibold text-slate-900">Dynamic Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Select Workspace</h1>
          <p className="text-slate-600">
            Welcome back, {user?.name}. Choose a workspace to continue.
          </p>
        </div>

        {/* Tenant cards */}
        {tenants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => handleSelectTenant(tenant)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xl">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                    <p className="text-sm text-slate-500">{tenant.slug}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
                <Button className="w-full" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Enter Workspace
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">No workspaces found</h3>
              <p className="text-sm text-slate-600 mt-1">
                You are not a member of any workspace yet.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
