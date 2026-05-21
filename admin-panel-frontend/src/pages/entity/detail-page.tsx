import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pencil } from 'lucide-react';
import { DynamicForm } from '@/components/dynamic/dynamic-form';
import { PermissionGuard } from '@/lib/auth';
import { useEntityConfig } from '@/lib/hooks/use-metadata';
import { useEntityDetail } from '@/lib/hooks/use-dynamic-api';

export const DetailPage: React.FC = () => {
  const { entitySlug = '', id = '' } = useParams<{ entitySlug: string; id: string }>();
  const navigate = useNavigate();

  const { data: entityConfig, isLoading: configLoading } = useEntityConfig(entitySlug);
  const { data: record, isLoading: recordLoading } = useEntityDetail(entitySlug, id);

  const isLoading = configLoading || recordLoading;

  return (
    <PageContainer>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {isLoading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <h1 className="text-2xl font-semibold">
                {entityConfig?.label ?? entitySlug} Details
              </h1>
            )}
          </div>
          <PermissionGuard requiredPermission={entityConfig?.permissions.update}>
            <Button asChild size="sm" variant="outline">
              <Link to={`/entities/${entitySlug}/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </PermissionGuard>
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
                onSubmit={() => {}}
                readonly
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

export default DetailPage;
