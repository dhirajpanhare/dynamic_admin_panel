import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { DynamicDataGrid } from '@/components/data-grid/dynamic-data-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityConfig, useListViewConfig } from '@/lib/hooks/use-metadata';

export const ListPage: React.FC = () => {
  const { entitySlug = '' } = useParams<{ entitySlug: string }>();

  const { data: entityConfig, isLoading: entityLoading } = useEntityConfig(entitySlug);
  const { data: listConfig, isLoading: listLoading } = useListViewConfig(entitySlug);

  const isLoading = entityLoading || listLoading;

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* Header */}
        <div>
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="text-2xl font-semibold">{entityConfig?.label_plural ?? entitySlug}</h1>
          )}
          {entityConfig?.description && (
            <p className="text-sm text-muted-foreground mt-1">{entityConfig.description}</p>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : listConfig && entityConfig ? (
          <DynamicDataGrid
            entitySlug={entitySlug}
            config={listConfig}
            createPermission={entityConfig.permissions.create}
            editPermission={entityConfig.permissions.update}
            deletePermission={entityConfig.permissions.delete}
          />
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            Entity <strong>{entitySlug}</strong> not found or has no list configuration.
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ListPage;

