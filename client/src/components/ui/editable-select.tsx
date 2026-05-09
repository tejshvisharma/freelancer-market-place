import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  className?: string; // optional color styling per option
}

interface EditableSelectProps {
  value: string;
  options: SelectOption[];
  onSave: (newValue: string) => void;
  disabled?: boolean;
  triggerClassName?: string;
}

export default function EditableSelect({
  value,
  options,
  onSave,
  disabled = false,
  triggerClassName,
}: EditableSelectProps) {
  const currentOption = options.find((o) => o.value === value);

  const handleChange = (newValue: string) => {
    if (newValue !== value) {
      onSave(newValue); // immediately saves on selection
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          // Remove default select styling — make it look like a badge
          'h-auto w-auto border-none shadow-none px-2.5 py-1 text-xs font-medium rounded-full',
          'focus:ring-1 focus:ring-ring',
          currentOption?.className,
          triggerClassName
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              option.className
            )}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}