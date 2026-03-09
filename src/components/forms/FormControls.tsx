import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const controlBaseClass =
  'mt-1 block w-full rounded-lg border bg-white px-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

const getControlStateClass = (invalid?: boolean) =>
  invalid
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const FormSection = ({ title, description, className, children, ...props }: FormSectionProps) => (
  <section
    className={cx('space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5', className)}
    {...props}
  >
    {(title || description) && (
      <header className="space-y-1">
        {title ? <h3 className="text-sm font-semibold text-gray-900">{title}</h3> : null}
        {description ? <p className="text-xs text-gray-500">{description}</p> : null}
      </header>
    )}
    {children}
  </section>
);

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  label: string;
  required?: boolean;
  error?: ReactNode;
  helperText?: ReactNode;
}

export const FormField = ({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
  ...props
}: FormFieldProps) => (
  <div className={cx('space-y-1.5', className)} {...props}>
    <FormLabel htmlFor={id} required={required}>
      {label}
    </FormLabel>
    {children}
    {error ? <ErrorText>{error}</ErrorText> : null}
    {!error && helperText ? <HelperText>{helperText}</HelperText> : null}
  </div>
);

interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const FormLabel = ({ required, className, children, ...props }: FormLabelProps) => (
  <label className={cx('block text-sm font-medium text-gray-700', className)} {...props}>
    {children}
    {required ? <span className="ml-1 text-red-500">*</span> : null}
  </label>
);

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ invalid, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cx(controlBaseClass, 'h-11', getControlStateClass(invalid), className)}
      {...props}
    />
  ),
);
FormInput.displayName = 'FormInput';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ invalid, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cx(controlBaseClass, 'min-h-[112px] py-2.5', getControlStateClass(invalid), className)}
      {...props}
    />
  ),
);
FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ invalid, className, ...props }, ref) => (
    <select
      ref={ref}
      className={cx(controlBaseClass, 'h-11 pr-9', getControlStateClass(invalid), className)}
      {...props}
    />
  ),
);
FormSelect.displayName = 'FormSelect';

export const FormActions = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const ErrorText = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cx('text-sm text-red-600', className)} role="alert" {...props}>
    {children}
  </p>
);

export const HelperText = ({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cx('text-xs text-gray-500', className)} {...props}>
    {children}
  </p>
);

const formActionButtonBase =
  'inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

export const formButtonStyles = {
  primary: cx(
    formActionButtonBase,
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  ),
  secondary: cx(
    formActionButtonBase,
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  ),
};

export const FormSubmitButton = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="submit" className={cx(formButtonStyles.primary, className)} {...props} />
);

export const FormCancelButton = ({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={cx(formButtonStyles.secondary, className)} {...props} />
);
