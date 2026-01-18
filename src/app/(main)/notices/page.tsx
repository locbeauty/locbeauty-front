"use client";

import { CreateNoticeDialog } from "@/components/pages/notices/CreateNoticeDialog";
import { NoticesTable } from "@/components/pages/notices/NoticesTable";

export default function NoticesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Avisos</h1>
        <CreateNoticeDialog />
      </div>
      <NoticesTable />
    </div>
  );
}
