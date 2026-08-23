import { getLeads, isTelegramConfigured } from "@/lib/leads";
import { LeadList } from "@/components/admin/LeadList";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();
  const telegram = isTelegramConfigured();

  return (
    <div>
      <h1 className="font-display text-4xl text-sand">Заявки</h1>
      <p className="mt-2 text-sm text-muted">
        {leads.length === 0
          ? "Заявок пока нет."
          : `Всего ${leads.length} · новых ${leads.filter((lead) => !lead.read).length}`}
      </p>

      {!telegram && (
        <p className="mt-6 border border-accent/30 bg-accent/5 p-4 text-xs leading-relaxed text-sand-dim">
          Уведомления в Telegram не настроены — заявки видно только здесь. Как их включить,
          написано в разделе «Настройки».
        </p>
      )}

      {leads.length > 0 && <LeadList leads={leads} />}
    </div>
  );
}
