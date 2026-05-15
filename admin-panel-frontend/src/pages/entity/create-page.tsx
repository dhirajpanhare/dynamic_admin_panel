import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CreatePage: React.FC = () => {
  const { entitySlug } = useParams<{ entitySlug: string }>();

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Create Page - {entitySlug}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dynamic create page for entity: {entitySlug}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This will be implemented in Phase 5 with dynamic forms.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default CreatePage;
