import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionItemsTable } from '@/components/ActionItemsTable';
import { CreateActionItemDialog } from '@/components/CreateActionItemDialog';
import { useActionItems } from '@/hooks/useData';

const ActionItems = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    actionItems,
    loading,
    toggleActive,
    updateActionItem,
    deleteActionItem,
  } = useActionItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Action Items</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionItemsTable
            items={actionItems}
            loading={loading}
            onToggleActive={toggleActive}
            onUpdate={updateActionItem}
            onDelete={deleteActionItem}
          />
        </CardContent>
      </Card>

      <CreateActionItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default ActionItems;
