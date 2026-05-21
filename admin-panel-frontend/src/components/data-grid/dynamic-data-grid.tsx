import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useEntityList, useDeleteEntity, useExportEntity } from '@/lib/hooks/use-dynamic-api';
import { PermissionGuard } from '@/lib/auth';
import type { ListViewConfig, ListViewColumn } from '@/lib/api/metadata.api';
import type { ListParams } from '@/lib/api/dynamic.api';
import { ROUTES } from '@/config/constants';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCellValue(value: any, fmt?: string): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;

  if (fmt === 'currency') return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  if (fmt === 'date') {
    try { return format(new Date(value), 'MMM d, yyyy'); } catch { return String(value); }
  }
  if (fmt === 'datetime') {
    try { return format(new Date(value), 'MMM d, yyyy HH:mm'); } catch { return String(value); }
  }
  if (fmt === 'boolean') return value ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>;
  if (fmt === 'badge') return <Badge variant="secondary">{String(value)}</Badge>;

  return String(value);
}

function buildColumnDef(col: ListViewColumn, onSort: (field: string) => void, currentSort: { field: string; dir: 'asc' | 'desc' } | null): ColumnDef<any> {
  return {
    id: col.field,
    accessorKey: col.field,
    header: () => (
      <div
        className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer select-none' : ''}`}
        style={{ textAlign: col.align ?? 'left', width: col.width }}
        onClick={col.sortable ? () => onSort(col.field) : undefined}
      >
        {col.label}
        {col.sortable && (
          currentSort?.field === col.field
            ? currentSort.dir === 'asc'
              ? <ArrowUp className="h-3 w-3" />
              : <ArrowDown className="h-3 w-3" />
            : <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </div>
    ),
    cell: ({ getValue }) => formatCellValue(getValue(), col.format),
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DynamicDataGridProps {
  entitySlug: string;
  config: ListViewConfig;
  /** Permissions slugs e.g. "products.create" */
  createPermission?: string;
  editPermission?: string;
  deletePermission?: string;
  /** Override create route */
  createPath?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const DynamicDataGrid: React.FC<DynamicDataGridProps> = ({
  entitySlug,
  config,
  createPermission,
  editPermission,
  deletePermission,
  createPath,
}) => {
  const navigate = useNavigate();

  // ── Server-side params ──
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(
    config.default_sort ? { field: config.default_sort.field, dir: config.default_sort.direction } : null
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const params: ListParams = {
    page,
    perPage,
    search: debouncedSearch || undefined,
    sort: sort?.field,
    order: sort?.dir,
  };

  const { data, isLoading, isError } = useEntityList(entitySlug, params);
  const deleteMutation = useDeleteEntity(entitySlug);
  const exportMutation = useExportEntity(entitySlug);

  const handleSort = (field: string) => {
    setSort((prev) =>
      prev?.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    );
    setPage(1);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // error toast handled by mutation
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(rowSelection);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected record(s)?`)) return;
    for (const id of ids) {
      await deleteMutation.mutateAsync(id);
    }
    setRowSelection({});
  };

  const handleExport = () => {
    exportMutation.mutate({ format: 'xlsx', ...params });
  };

  // ── Column definitions ──
  const columns: ColumnDef<any>[] = [
    // Selection column
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      size: 40,
    },
    // Data columns from config
    ...config.columns.map((col) => buildColumnDef(col, handleSort, sort)),
    // Actions column
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const id = row.original.id ?? row.original.Id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/entities/${entitySlug}/${id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <PermissionGuard requiredPermission={editPermission}>
                <DropdownMenuItem
                  onClick={() => navigate(`/entities/${entitySlug}/${id}/edit`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </PermissionGuard>
              <PermissionGuard requiredPermission={deletePermission}>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 60,
    },
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: data?.totalPages ?? -1,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableRowSelection: true,
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <PermissionGuard requiredPermission={deletePermission}>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete ({selectedCount})
              </Button>
            </PermissionGuard>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
          <PermissionGuard requiredPermission={createPermission}>
            <Button
              size="sm"
              onClick={() => navigate(createPath ?? `/entities/${entitySlug}/new`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-destructive">
                  Failed to load data. Please try again.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data ? `${data.total} record${data.total !== 1 ? 's' : ''}` : '—'}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2">
            Page {page} of {data?.totalPages ?? 1}
          </span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPage((p) => p + 1)} disabled={!data || page >= data.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => data && setPage(data.totalPages)} disabled={!data || page >= data.totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DynamicDataGrid;
