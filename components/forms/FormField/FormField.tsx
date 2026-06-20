import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
};

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type Props = InputProps | TextareaProps;

const inputClass =
  'w-full rounded-md border border-border-input bg-surface px-3 py-2 text-sm text-foreground shadow-sm ' +
  'placeholder:text-muted-foreground ' +
  'focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring ' +
  'disabled:bg-muted disabled:text-muted-foreground';

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  Props
>(({ label, error, required, hint, as, ...props }, ref) => {
  const id = (props as { id?: string }).id ?? label;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground-secondary">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={`${inputClass} min-h-[100px] resize-y ${error ? 'border-destructive focus:ring-destructive' : ''}`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          ref={ref as React.Ref<HTMLInputElement>}
          className={`${inputClass} ${error ? 'border-destructive focus:ring-destructive' : ''}`}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
