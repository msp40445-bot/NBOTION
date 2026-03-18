import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Page } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface DatabaseViewProps {
  page: Page;
}

export function DatabaseView({ page }: DatabaseViewProps) {
  const { updatePage, addDatabaseRow, updateDatabaseCell, deleteDatabaseRow } = useWorkspaceStore();
  const [title, setTitle] = useState(page.title);

  const columns = page.databaseSchema || [];
  const rows = page.databaseRows || [];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-3xl">{page.icon || '📊'}</span>
      </div>
      <input
        value={title}
        onChange={(e) => { setTitle(e.target.value); updatePage(page.id, { title: e.target.value }); }}
        className="text-3xl font-bold bg-transparent border-none outline-none mb-6 w-full"
        placeholder="Untitled Database"
      />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-2 text-left font-medium text-muted-foreground border-b border-r border-border">
                    {col.name}
                  </th>
                ))}
                <th className="px-4 py-2 border-b border-border w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 group">
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-1.5 border-b border-r border-border">
                      {col.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={!!row.cells[col.id]}
                          onChange={(e) => updateDatabaseCell(page.id, row.id, col.id, e.target.checked)}
                          className="rounded"
                        />
                      ) : col.type === 'select' ? (
                        <select
                          value={(row.cells[col.id] as string) || ''}
                          onChange={(e) => updateDatabaseCell(page.id, row.id, col.id, e.target.value)}
                          className="bg-transparent border-none text-sm w-full"
                        >
                          <option value="">-</option>
                          {col.options?.map((opt) => (
                            <option key={opt.id} value={opt.name}>{opt.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={(row.cells[col.id] as string) || ''}
                          onChange={(e) => updateDatabaseCell(page.id, row.id, col.id, e.target.value)}
                          className="bg-transparent border-none w-full outline-none text-sm"
                          placeholder="Empty"
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 border-b border-border">
                    <button
                      onClick={() => deleteDatabaseRow(page.id, row.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => addDatabaseRow(page.id)}
          className="w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted/30 flex items-center gap-2"
        >
          <Plus size={14} />
          New row
        </button>
      </div>
    </div>
  );
}
