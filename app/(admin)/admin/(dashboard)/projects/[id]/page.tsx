import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/content";
import { getStorage } from "@/lib/storage";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return <ProjectEditor project={project} isNew={false} storageKind={getStorage().kind} />;
}
