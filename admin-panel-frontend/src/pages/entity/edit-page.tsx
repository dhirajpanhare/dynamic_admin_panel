import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EditPage: React.FC = () => {
  const { entitySlug, id } = useParams<{ entitySlug: string; id: string }>();

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Edit Page - {entitySlug}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dynamic edit page for entity: {entitySlug}, ID: {id}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will be implemented in Phase 5 with dynamic forms.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default EditPage;
