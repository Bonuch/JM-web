import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import { getStorage } from "@/lib/storage";
import { ProjectList } from "@/components/admin/ProjectList";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();
  const storageKind = getStorage().kind;

  const published = projects.filter((project) => project.published).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl text-sand">Проекты</h1>
          <p className="mt-2 text-sm text-muted">
            Всего {projects.length} · опубликовано {published}
            {storageKind === "local" && " · файлы сохраняются локально в папку проекта"}
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="rounded-full bg-sand px-6 py-3 text-xs font-medium tracking-[0.1em] text-ink uppercase transition-colors hover:bg-accent"
        >
          Добавить проект
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="mt-16 border border-dashed border-line px-8 py-20 text-center">
          <p className="font-display text-2xl text-sand">Пока ни одного проекта</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Добавьте первый кейс: загрузите рендеры, напишите название и краткое описание. Сайт
            сразу покажет его на главной и в портфолио.
          </p>
          <Link
            href="/admin/projects/new"
            className="mt-8 inline-block rounded-full border border-line-strong px-6 py-3 text-xs tracking-[0.1em] text-sand uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Создать проект
          </Link>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
