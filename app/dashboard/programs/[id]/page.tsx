import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, CircleCheck, CloudUpload, Eye, GripVertical, ImagePlus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getProgram, meTrainer, programs } from "@/lib/mock-data"
import { money } from "@/lib/utils"

type Props = PageProps<"/dashboard/programs/[id]">

export const generateStaticParams = () => [
  { id: "new" },
  ...programs.filter((p) => p.trainerId === meTrainer.id).map((p) => ({ id: p.id })),
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: id === "new" ? "New program" : (getProgram(id)?.title ?? "Program") }
}

const card = "rounded-2xl border bg-card p-6"

// ponytail: static editor; uploads go to ImageKit in Phase 3, saving goes through server actions in Phase 4
export default function ProgramEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-[70vh] rounded-2xl" />}>
      <ProgramEditor params={params} />
    </Suspense>
  )
}

async function ProgramEditor({ params }: Pick<Props, "params">) {
  const { id } = await params
  const program = id === "new" ? undefined : getProgram(id)
  if (id !== "new" && program?.trainerId !== meTrainer.id) notFound()

  return (
    <div className="space-y-6">
      <Link href="/dashboard/programs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All programs
      </Link>
      <PageHeader
        title={program?.title ?? "New program"}
        description={program ? "Edit details, manage lessons, and control visibility." : "Add the basics, then upload your lessons."}
      >
        {program && (
          <Link href={`/programs/${program.id}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
            <Eye /> Preview
          </Link>
        )}
        <Button size="lg">{program ? "Save changes" : "Create program"}</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="font-semibold">Details</h2>
            <div className="mt-5 grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" defaultValue={program?.title} placeholder="e.g. 8-Week Strength Foundations" className="h-10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} defaultValue={program?.description} placeholder="What will clients achieve? Who is it for?" />
              </div>
              <div className="grid gap-2 sm:max-w-xs">
                <Label htmlFor="price">Price</Label>
                <div className="flex h-10 items-center rounded-lg border border-input px-3 focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                  <span className="text-muted-foreground">$</span>
                  <input id="price" type="number" min={1} defaultValue={program && program.priceCents / 100} placeholder="49" className="w-full bg-transparent px-2 text-sm outline-none" />
                  <span className="text-xs text-muted-foreground">USD</span>
                </div>
              </div>
            </div>
          </section>

          <section className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Lessons</h2>
                <p className="text-sm text-muted-foreground">The first lesson is a free preview for everyone.</p>
              </div>
              <span className="text-sm text-muted-foreground">{program?.lessons.length ?? 0} videos</span>
            </div>

            {program && (
              <ol className="mt-5 divide-y rounded-xl border">
                {program.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-3 py-3">
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">{l.position}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{l.title}</span>
                    {l.position === 1 && <Badge variant="secondary">Free preview</Badge>}
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                      <CircleCheck className="size-3.5 text-primary" /> Ready
                    </span>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${l.title}`}>
                      <Trash2 />
                    </Button>
                  </li>
                ))}
                <li className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                      {program.lessons.length + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">bonus-accessory-work.mp4</span>
                    <span className="text-xs text-muted-foreground">Uploading · 64%</span>
                  </div>
                  <div className="mt-2 ml-10 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[64%] rounded-full bg-primary" />
                  </div>
                </li>
              </ol>
            )}

            <label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition hover:border-primary hover:bg-accent/30">
              <input type="file" accept="video/*" className="sr-only" />
              <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
                <CloudUpload className="size-5" />
              </span>
              <span className="mt-3 text-sm font-medium">Drop a video here or click to upload</span>
              <span className="mt-1 text-xs text-muted-foreground">MP4 or MOV · up to 100 MB · stored privately</span>
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section className={card}>
            <h2 className="font-semibold">Cover image</h2>
            <label className="group relative mt-4 grid aspect-video cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed text-center">
              <input type="file" accept="image/*" className="sr-only" />
              {program && <Image src={program.coverUrl} alt="" fill loading="eager" sizes="340px" className="object-cover" />}
              <span className="relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition group-hover:bg-black/60 group-hover:text-white">
                <ImagePlus className="size-5" />
                <span className={program ? "sr-only group-hover:not-sr-only" : ""}>{program ? "Replace image" : "Upload cover"}</span>
              </span>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">16:9 · JPG or PNG · optimized automatically</p>
          </section>

          <section className={card}>
            <h2 className="font-semibold">Visibility</h2>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Published</span>
                <span className="text-xs text-muted-foreground">Visible on your profile and the directory</span>
              </span>
              <input type="checkbox" defaultChecked={program?.published} className="peer sr-only" />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-input transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
            </label>
            {program && program.sales > 0 && (
              <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {program.sales} clients own this program, so it can be unpublished but not deleted.
              </p>
            )}
          </section>

          {program && (
            <section className={card}>
              <h2 className="font-semibold">Performance</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Sales</dt>
                  <dd className="font-heading text-2xl font-bold">{program.sales}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Revenue</dt>
                  <dd className="font-heading text-2xl font-bold">{money(program.sales * program.priceCents)}</dd>
                </div>
              </dl>
              <Button variant="destructive" className="mt-5 w-full" disabled={program.sales > 0}>
                <Trash2 /> Delete program
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
