"use client";

import { CreateNoticeDialog } from "@/components/pages/notices/CreateNoticeDialog";
import { NoticesTable } from "@/components/pages/notices/NoticesTable";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export default function NoticesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Avisos</h1>
        <Can module={ SYSTEM_MODULES.NOTICES } action="canCreate">
          <CreateNoticeDialog />
        </Can>
      </div>
      <NoticesTable />
    </div>
  );
}
