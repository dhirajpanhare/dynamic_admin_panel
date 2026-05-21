import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { DynamicForm } from '@/components/dynamic/dynamic-form';
import { useEntityConfig } from '@/lib/hooks/use-metadata';
import { useCreateEntity } from '@/lib/hooks/use-dynamic-api';

export const CreatePage: React.FC = () => {
  const { entitySlug = '' } = useParams<{ entitySlug: string }>();
  const navigate = useNavigate();

  const { data: entityConfig, isLoading } = useEntityConfig(entitySlug);
  const createMutation = useCreateEntity(entitySlug);

  const handleSubmit = async (data: Record<string, any>) => {
    await createMutation.mutateAsync(data);
    navigate(`/entities/${entitySlug}`);
  };

  return (
    <PageContainer>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="text-2xl font-semibold">
              New {entityConfig?.label ?? entitySlug}
            </h1>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : entityConfig ? (
              <DynamicForm
                config={entityConfig}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
                submitLabel={`Create ${entityConfig.label}`}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Entity <strong>{entitySlug}</strong> configuration not found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CreatePage;

