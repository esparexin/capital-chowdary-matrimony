import { History } from "lucide-react";

export interface DashboardRevisionRecord {
  id: string;
  entityType: string;
  action: string;
  createdAt: string;
  changedByAdminId: string | null;
}

interface DashboardRecentRevisionsProps {
  recentRevisions: DashboardRevisionRecord[];
}

export function DashboardRecentRevisions({ recentRevisions }: DashboardRecentRevisionsProps) {
  return (
    <div id="recent-revisions" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-foreground uppercase">
            Recent Administrative Activity
          </h2>
          <p className="text-xs text-muted-foreground">
            Immutable audit trail records stored in Cloudflare D1 content revisions.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <History className="size-3.5" />
          Audit Logging Active
        </span>
      </div>

      {recentRevisions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <History className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">No recent revisions</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Edits made across Homepage, Pages, Services, Pricing, Events, and Settings will be
            logged here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRevisions.map((rev) => (
                <tr key={rev.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground capitalize">
                    {rev.entityType}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        rev.action === "publish"
                          ? "bg-emerald-100 text-emerald-800"
                          : rev.action === "delete"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {rev.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground truncate max-w-[140px]">
                    {rev.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
