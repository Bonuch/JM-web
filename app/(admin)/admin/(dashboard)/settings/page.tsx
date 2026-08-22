import { getSettings } from "@/lib/content";
import { isTelegramConfigured } from "@/lib/leads";
import { getStorage } from "@/lib/storage";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsEditor
      settings={settings}
      telegramConfigured={isTelegramConfigured()}
      storageKind={getStorage().kind}
    />
  );
}
