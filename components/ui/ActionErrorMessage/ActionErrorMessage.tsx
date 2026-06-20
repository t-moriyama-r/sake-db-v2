type Props = {
  message: string;
};

export function ActionErrorMessage({ message }: Props) {
  if (!message) return null;
  return (
    <div className="rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-subtle-foreground">
      {message}
    </div>
  );
}
