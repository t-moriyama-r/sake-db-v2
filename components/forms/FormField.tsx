import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
};

type InputFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type TextareaFieldProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type FormFieldProps = InputFieldProps | TextareaFieldProps;

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(({ label, error, required, hint, as, ...props }, ref) => {
  const id = (props as { id?: string }).id ?? label;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={`${inputClass} min-h-[100px] resize-y ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          ref={ref as React.Ref<HTMLInputElement>}
          className={`${inputClass} ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
