import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ListPage: React.FC = () => {
  const { entitySlug } = useParams<{ entitySlug: string }>();

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>List Page - {entitySlug}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dynamic list page for entity: {entitySlug}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will be implemented in Phase 6 with dynamic data grid.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ListPage;
