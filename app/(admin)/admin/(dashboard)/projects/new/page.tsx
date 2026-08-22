import { getAllProjects } from "@/lib/content";
import { getStorage } from "@/lib/storage";
import { emptyProject } from "@/lib/project-template";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const projects = await getAllProjects();

  // новый проект встаёт первым в списке — обычно добавляют свежую работу
  const project = { ...emptyProject(), order: -1 * (projects.length + 1) };

  return <ProjectEditor project={project} isNew storageKind={getStorage().kind} />;
}
