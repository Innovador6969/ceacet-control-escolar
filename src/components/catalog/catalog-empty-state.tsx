type CatalogEmptyStateProps = {
  message: string;
};

export function CatalogEmptyState({ message }: CatalogEmptyStateProps) {
  return <div className="p-8 text-center text-sm text-muted">{message}</div>;
}
