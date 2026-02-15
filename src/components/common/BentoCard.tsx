import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
}

export function BentoCard({ children, className, title, action }: BentoCardProps) {
    return (
        <div className={cn("bento-card p-6 flex flex-col h-full", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    {title && <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>}
                    {action && <div className="text-sm text-muted-foreground">{action}</div>}
                </div>
            )}
            <div className="flex-1">{children}</div>
        </div>
    );
}
