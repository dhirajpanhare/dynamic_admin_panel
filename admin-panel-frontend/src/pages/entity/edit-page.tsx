import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { DynamicForm } from '@/components/dynamic/dynamic-form';
import { useEntityConfig } from '@/lib/hooks/use-metadata';
import { useEntityDetail, useUpdateEntity } from '@/lib/hooks/use-dynamic-api';

export const EditPage: React.FC = () => {
  const { entitySlug = '', id = '' } = useParams<{ entitySlug: string; id: string }>();
  const navigate = useNavigate();

  const { data: entityConfig, isLoading: configLoading } = useEntityConfig(entitySlug);
  const { data: record, isLoading: recordLoading } = useEntityDetail(entitySlug, id);
  const updateMutation = useUpdateEntity(entitySlug);

  const isLoading = configLoading || recordLoading;

  const handleSubmit = async (data: Record<string, any>) => {
    await updateMutation.mutateAsync({ id, data });
    navigate(`/entities/${entitySlug}/${id}`);
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
              Edit {entityConfig?.label ?? entitySlug}
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
            ) : entityConfig && record ? (
              <DynamicForm
                config={entityConfig}
                initialData={record}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
                submitLabel="Save Changes"
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Record not found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default EditPage;
