import { useWorkspaceStore } from '@/stores/workspaceStore';
import { PageEditor } from './PageEditor';
import { DatabaseView } from './DatabaseView';

export function WorkspaceView() {
  const { pages, currentPageId } = useWorkspaceStore();
  const currentPage = pages.find((p) => p.id === currentPageId);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a page or create a new one</p>
      </div>
    );
  }

  if (currentPage.isDatabase) {
    return <DatabaseView page={currentPage} />;
  }

  return <PageEditor page={currentPage} />;
}
