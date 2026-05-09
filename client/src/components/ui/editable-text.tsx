import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    disabled?: boolean;
}

export function EditableText({
    value,
    onSave,
    placeholder = 'click to edit',
    multiline = false,
    className,
    disabled = false,
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            const length = inputRef.current?.value.length || 0;
            inputRef.current?.setSelectionRange(length, length);
        }
    }, [isEditing]);

    const handleStart = () => {
        if (disabled) return;
        setIsEditing(true);
    };

    const handleSave = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== value) {
            onSave(trimmed);   // only call onSave if value actually changed
        } else {
            setDraft(value);   // revert to original if empty or unchanged
        }
        setIsEditing(false);

    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setDraft(value);         // revert
            setIsEditing(false);
        }
        // For single line: Enter saves
        // For multiline: Enter adds newline, Ctrl+Enter saves
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
        if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSave();
        }
    };

    // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    const sharedProps = {
      ref: inputRef,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: cn(
        'w-full bg-background border rounded-md px-2 py-1 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      ),
    };

    return multiline ? (
      <textarea
        {...sharedProps}
        rows={4}
        className={cn(sharedProps.className, 'resize-none')}
      />
    ) : (
      <input {...sharedProps} type="text" />
    );
  }

  // ── Display mode ───────────────────────────────────────────────────────────
  return (
    <div
      role={disabled ? undefined : 'button'}
      onClick={handleStart}
      className={cn(
        'group relative rounded-md px-2 py-1 -mx-2 -my-1',
        !disabled && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
    >
      {/* The text itself */}
      <span className={cn(
        'block',
        !value && 'text-muted-foreground italic'
      )}>
        {value || placeholder}
      </span>

      {/* Pencil hint — only shows on hover, only when editable */}
      {!disabled && (
        <Pencil className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}