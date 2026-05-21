import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Workspace } from '@/lib/store';
import { useWorkspaceStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWorkspace?: Workspace | null;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  editWorkspace,
}) => {
  const { addWorkspace, updateWorkspace } = useWorkspaceStore();
  const [name, setName] = useState(editWorkspace?.name || '');
  const [slug, setSlug] = useState(editWorkspace?.slug || '');
  const [description, setDescription] = useState(editWorkspace?.description || '');
  const [organizationType, setOrganizationType] = useState<Workspace['organizationType']>(
    editWorkspace?.organizationType || 'startup'
  );
  const [industry, setIndustry] = useState(editWorkspace?.industry || '');
  const [country, setCountry] = useState(editWorkspace?.location?.country || '');
  const [city, setCity] = useState(editWorkspace?.location?.city || '');
  const [email, setEmail] = useState(editWorkspace?.contact?.email || '');
  const [phone, setPhone] = useState(editWorkspace?.contact?.phone || '');
  const [website, setWebsite] = useState(editWorkspace?.contact?.website || '');
  const [plan, setPlan] = useState<Workspace['plan']>(editWorkspace?.plan || 'free');
  const [logoPreview, setLogoPreview] = useState<string | null>(editWorkspace?.logo || null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editWorkspace) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    if (!slug.trim()) {
      toast.error('Workspace slug is required');
      return;
    }

    const workspaceData: Workspace = {
      id: editWorkspace?.id || uuidv4(),
      name,
      slug,
      logo: logoPreview || undefined,
      description,
      organizationType,
      industry,
      location: country ? { country, city } : undefined,
      contact: email ? { email, phone, website } : undefined,
      plan,
      status: editWorkspace?.status || 'active',
      memberCount: editWorkspace?.memberCount || 1,
      createdAt: editWorkspace?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editWorkspace) {
      updateWorkspace(editWorkspace.id, workspaceData);
      toast.success('Workspace updated successfully');
    } else {
      addWorkspace(workspaceData);
      toast.success('Workspace created successfully');
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{editWorkspace ? 'Edit Workspace' : 'Create New Workspace'}</CardTitle>
                <CardDescription>
                  {editWorkspace
                    ? 'Update your workspace details'
                    : 'Set up a new workspace for your team'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-16 rounded-lg object-cover border"
                    />
                  )}
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 p-4 hover:border-muted-foreground/50 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workspace Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workspace Slug *</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g., acme-corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your workspace"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Type</label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value as Workspace['organizationType'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="enterprise">Enterprise</option>
                    <option value="startup">Startup</option>
                    <option value="personal">Personal</option>
                    <option value="non-profit">Non-profit</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-medium">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., United States"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., San Francisco"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Information</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="space-y-4">
              <h3 className="font-medium">Subscription Plan</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['free', 'pro', 'enterprise'] as const).map((planOption) => (
                  <button
                    key={planOption}
                    onClick={() => setPlan(planOption)}
                    className={`rounded-lg border-2 p-4 text-center transition-colors ${
                      plan === planOption
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium capitalize">{planOption}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editWorkspace ? 'Update Workspace' : 'Create Workspace'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateWorkspaceModal;
