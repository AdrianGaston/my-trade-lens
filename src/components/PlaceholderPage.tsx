import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
      <Construction className="h-12 w-12" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm">Esta seção será implementada em breve.</p>
    </div>
  );
}
