import { useState } from 'react';
import { type DragEndEvent, DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Type,
  List,
  CheckSquare,
  Calendar,
  Mail,
  Phone,
  Hash,
  FileText,
  Trash2,
  Eye,
  Code,
} from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  icon: any;
}

const fieldTypes = [
  { type: 'text', label: 'Text Field', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Text Area', icon: FileText },
  { type: 'select', label: 'Select', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'date', label: 'Date Picker', icon: Calendar },
];

function SortableField({
  field,
  onRemove,
}: {
  field: FormField;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{field.label}</span>
          {field.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <span className="text-sm text-slate-500">{field.type}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}

export function FormBuilderPage() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState('Untitled Form');
  const [showPreview, setShowPreview] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (fieldType: typeof fieldTypes[0]) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType.type,
      label: fieldType.label,
      placeholder: `Enter ${fieldType.label.toLowerCase()}`,
      required: false,
      icon: fieldType.icon,
    };
    setFormFields([...formFields, newField]);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  const generateSchema = () => {
    return {
      formName,
      fields: formFields.map((field) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
      })),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="text-2xl font-semibold border-none px-0 focus-visible:ring-0"
          />
          <p className="text-sm text-slate-600 mt-1">
            Drag and drop components to build your form
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button variant="outline">
            <Code className="mr-2 h-4 w-4" />
            View JSON
          </Button>
          <Button>Save Form</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Component Toolbox */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Components
          </h3>
          <div className="space-y-2">
            {fieldTypes.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-primary hover:bg-primary-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {fieldType.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Form Canvas */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Form Layout
          </h3>
          {formFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">
                No fields yet
              </h4>
              <p className="text-sm text-slate-600 max-w-sm">
                Start building your form by selecting components from the toolbox
              </p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={formFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {formFields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onRemove={() => removeField(field.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </Card>
      </div>

      {/* JSON Schema Preview */}
      {showPreview && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            JSON Schema Preview
          </h3>
          <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-100 overflow-x-auto">
            {JSON.stringify(generateSchema(), null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
