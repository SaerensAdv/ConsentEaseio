import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("py-12", className)} data-testid="empty-state">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="flex justify-center">
          <Button onClick={action.onClick} data-testid="empty-state-action">
            {action.icon && <action.icon size={16} className="mr-2" />}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
