import { Navigation } from "./navigation";
import { BrandSelector } from "./brand-selector";

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-slate-950">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Sector Signal
        </h1>
      </div>
      <div className="border-b p-4">
        <BrandSelector />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <Navigation />
      </div>
    </div>
  );
}
