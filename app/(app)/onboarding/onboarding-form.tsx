"use client"

import { ArrowRight, Check, Dumbbell, ImagePlus, Trophy } from "lucide-react"
import { createProfile } from "@/app/actions/profile"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { specialties } from "@/lib/specialties"

const roles = [
  { value: "client", icon: Dumbbell, title: "I want to train", text: "Find a coach, follow video programs, and book 1:1 sessions." },
  { value: "trainer", icon: Trophy, title: "I'm a coach", text: "Sell programs, offer paid sessions, and manage your clients." },
]

// Role switch is pure CSS: the form `group` reveals trainer fields when #role-trainer is checked
export function OnboardingForm() {
  return (
    <ActionForm action={createProfile} className="group mx-auto max-w-3xl px-5 py-16">
      <p className="text-center text-xs font-semibold tracking-[0.3em] text-primary uppercase">Welcome to Repwise</p>
      <h1 className="mt-3 text-center text-4xl font-bold sm:text-5xl">How will you use Repwise?</h1>
      <p className="mt-3 text-center text-muted-foreground">Pick a role to set up your account.</p>

      <fieldset className="mt-10 grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Role</legend>
        {roles.map(({ value, icon: Icon, title, text }) => (
          <label
            key={value}
            className="group/role relative cursor-pointer rounded-2xl border bg-card p-6 transition hover:border-primary/50 has-checked:border-primary has-checked:bg-accent/40 has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <input type="radio" name="role" id={`role-${value}`} value={value} defaultChecked={value === "client"} className="sr-only" />
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-6" />
            </span>
            <span className="mt-5 block text-lg font-semibold">{title}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
            <span className="absolute top-5 right-5 grid size-6 place-items-center rounded-full border text-transparent transition group-has-checked/role:border-primary group-has-checked/role:bg-primary group-has-checked/role:text-primary-foreground">
              <Check className="size-3.5" />
            </span>
          </label>
        ))}
      </fieldset>

      <section className="mt-8 hidden rounded-2xl border bg-card p-6 group-has-[#role-trainer:checked]:block sm:p-8">
        <h2 className="text-xl font-semibold">Your coach profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">This is what clients see in the directory. You can edit it anytime.</p>

        <div className="mt-6 grid gap-6">
          {/* ponytail: inert until ImageKit uploads land (Phase 3); Google sign-ups keep their Google photo */}
          <label className="flex cursor-pointer items-center gap-5">
            <input type="file" accept="image/*" className="sr-only" />
            <span className="grid size-20 place-items-center rounded-full border-2 border-dashed text-muted-foreground transition hover:border-primary hover:text-primary">
              <ImagePlus className="size-6" />
            </span>
            <span>
              <span className="block text-sm font-medium">Upload a profile photo</span>
              <span className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB</span>
            </span>
          </label>

          <div className="grid gap-2">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" name="headline" maxLength={80} placeholder="Strength & conditioning coach" className="h-10" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={4} maxLength={1000} placeholder="Your experience, coaching style, and who you help best." />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Specialties</legend>
            <div className="flex flex-wrap gap-2">
              {specialties.map(({ slug, label, icon: Icon }) => (
                <label
                  key={slug}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition hover:border-primary/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
                >
                  <input type="checkbox" name="specialties" value={slug} className="sr-only" />
                  <Icon className="size-4" /> {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="price">Price per 60-min session</Label>
            <div className="flex h-10 items-center rounded-lg border border-input bg-transparent px-3 focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
              <span className="text-muted-foreground">$</span>
              <input id="price" name="price" type="number" min={10} max={1000} step={5} placeholder="80" className="w-full bg-transparent px-2 text-sm outline-none" />
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <SubmitButton size="xl" className="group-has-[#role-trainer:checked]:hidden">
          Continue <ArrowRight />
        </SubmitButton>
        <SubmitButton size="xl" className="hidden group-has-[#role-trainer:checked]:inline-flex">
          Create coach profile <ArrowRight />
        </SubmitButton>
      </div>
    </ActionForm>
  )
}
