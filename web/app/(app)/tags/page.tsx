import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChildTagRow,
  CreateChildTagForm,
  RootRenameForm,
} from "@/components/tag-admin-forms";
import { describeDbFailure } from "@/lib/db-error-hint";
import { getRootTags, getTagChildren, getRootBySlug } from "@/lib/tag-tree";

export const dynamic = "force-dynamic";

type TagsPageProps = {
  searchParams: Promise<{ area?: string | string[] }>;
};

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const sp = await searchParams;

  let roots: Awaited<ReturnType<typeof getRootTags>>;
  try {
    roots = await getRootTags();
  } catch (err) {
    const { kind, technicalMessage } = describeDbFailure(err);
    const showTech =
      process.env.NODE_ENV === "development" ||
      process.env.VERCEL_ENV === "preview";
    return (
      <div className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Теги</h1>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Не вдалося завантажити теги ({kind}).</p>
          {showTech ? (
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs">
              {technicalMessage}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Теги</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          У базі ще немає кореневих тегів. Додай міграцію/seed.
        </p>
      </div>
    );
  }

  const areaRaw = typeof sp.area === "string" ? sp.area.trim() : "";
  const areaParam = areaRaw || roots[0].slug;
  const root = await getRootBySlug(areaParam);
  if (!root || root.slug !== areaParam) {
    redirect(`/tags?area=${encodeURIComponent(roots[0].slug)}`);
  }

  const children = await getTagChildren(root.id);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-zinc-200/90 bg-white/70 px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950/60 md:w-52 md:border-b-0 md:border-r md:py-6">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
          Сфери
        </p>
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Обери сферу">
          {roots.map((r) => {
            const active = r.slug === root.slug;
            return (
              <Link
                key={r.id}
                href={`/tags?area=${encodeURIComponent(r.slug)}`}
                scroll={false}
                className={
                  active
                    ? "shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }
                aria-current={active ? "page" : undefined}
              >
                {r.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-8 px-4 py-8 md:px-10">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Ієрархія тегів
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {root.name}
          </h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            Підтеги для цієї сфери з’являються в редакторі задачі. Slug генерується автоматично; його можна бачити в
            списку нижче.
          </p>
        </header>

        <RootRenameForm tagId={root.id} defaultName={root.name} />

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Підтеги
          </h2>
          {children.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200/90 bg-white/60 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
              Поки немає підтегів. Додай перший нижче.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {children.map((c) => (
                <ChildTagRow key={c.id} tag={c} />
              ))}
            </ul>
          )}
        </section>

        <CreateChildTagForm parentId={root.id} />
      </div>
    </div>
  );
}
