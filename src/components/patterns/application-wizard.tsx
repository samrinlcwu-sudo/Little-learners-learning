"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ClipboardList } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useApplications } from "@/lib/admissions/use-applications";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  APPLICATION_STEP_FIELDS,
  applicationWizardSchema,
  type ApplicationWizardInput,
  type ApplicationWizardValues,
} from "@/lib/validations/application";
import type { Application } from "@/lib/admissions/types";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { key: "applicant", title: "Applicant information", description: "Who we should keep in touch with about this application." },
  { key: "learner", title: "Learner information", description: "Which of your children this application is for." },
  { key: "interests", title: "Learning interest", description: "The subjects you'd like to focus on." },
  { key: "additional", title: "Additional information", description: "Anything else worth adding — entirely optional." },
  { key: "review", title: "Review & submit", description: "Check everything before you submit." },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-error-600">
        {" "}
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

function ApplicationProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <nav aria-label="Application progress">
      <p className="sr-only" aria-live="polite">
        Step {currentIndex + 1} of {STEPS.length}: {STEPS[currentIndex].title}
      </p>
      <ol className="flex items-center">
        {STEPS.map((step, index) => (
          <li key={step.key} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
            <span
              aria-current={index === currentIndex ? "step" : undefined}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                index < currentIndex
                  ? "bg-primary-600 text-white"
                  : index === currentIndex
                    ? "border-2 border-primary-600 text-primary-700"
                    : "border border-neutral-300 text-neutral-400",
              )}
            >
              {index < currentIndex ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}
            </span>
            {index < STEPS.length - 1 && (
              <span className={cn("mx-1.5 h-px flex-1 sm:mx-2", index < currentIndex ? "bg-primary-600" : "bg-neutral-200")} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm font-medium text-ink">
        Step {currentIndex + 1} of {STEPS.length} — {STEPS[currentIndex].title}
      </p>
    </nav>
  );
}

/**
 * The full application experience — one continuous, backend-honest
 * wizard. A draft (src/lib/admissions/types.ts) is created the moment
 * this mounts (before anything is typed), so "Save & exit" always has a
 * real record to persist to; each step validates only its own fields
 * before advancing, and the merged schema validates everything once more
 * before the final submit. See docs/ADMISSIONS_ARCHITECTURE.md,
 * "The premium application wizard (Prompt 52)."
 */
export interface ApplicationWizardProps {
  /** Present when resuming an existing draft (from ?id= on the page) — absent when starting fresh. Read server-side by the page, not via useSearchParams, so this stays a plain client component with no Suspense boundary needed. */
  initialApplicationId?: string;
}

function ApplicationWizard({ initialApplicationId }: ApplicationWizardProps) {
  const router = useRouter();
  const existingId = initialApplicationId;
  const { children, ready: childrenReady } = useChildProfiles();
  const { applications, ready, createApplication, updateApplication, submit } = useApplications();

  const [applicationId, setApplicationId] = React.useState<string | null>(existingId ?? null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [submittedApplication, setSubmittedApplication] = React.useState<Application | null>(null);
  const createdRef = React.useRef(false);
  const loadedForIdRef = React.useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationWizardInput, unknown, ApplicationWizardValues>({
    resolver: zodResolver(applicationWizardSchema),
    defaultValues: { name: "", email: "", phone: "", childId: "", learningInterests: [], message: "" },
  });

  // Create a real draft the moment the wizard opens fresh, so an id exists
  // from the start and "Save & exit" is never a no-op.
  React.useEffect(() => {
    if (existingId || createdRef.current || !ready) return;
    createdRef.current = true;
    const created = createApplication();
    setApplicationId(created.id);
    router.replace(`/dashboard/applications/new?id=${created.id}`);
  }, [existingId, ready, createApplication, router]);

  // Load an existing draft's values into the form once, the first time it's available — not on every later store update, which would fight the family's own in-progress typing.
  React.useEffect(() => {
    if (!applicationId || loadedForIdRef.current === applicationId) return;
    const application = applications.find((item) => item.id === applicationId);
    if (!application) return;
    loadedForIdRef.current = applicationId;
    reset({
      name: application.applicant?.name ?? "",
      email: application.applicant?.email ?? "",
      phone: application.applicant?.phone ?? "",
      childId: application.childId ?? "",
      learningInterests: application.learningInterests,
      message: application.message ?? "",
    });
  }, [applicationId, applications, reset]);

  function persistCurrentValues() {
    if (!applicationId) return;
    const values = getValues();
    const hasApplicantInfo = values.name.trim() || values.email.trim();
    updateApplication(applicationId, {
      applicant: hasApplicantInfo ? { name: values.name, email: values.email, phone: values.phone || undefined } : undefined,
      childId: values.childId || undefined,
      learningInterests: values.learningInterests ?? [],
      message: values.message,
    });
  }

  async function goNext() {
    const key = STEPS[stepIndex].key;
    const fields = key === "review" ? [] : APPLICATION_STEP_FIELDS[key as Exclude<StepKey, "review">];
    const valid = fields.length === 0 || (await trigger(fields as (keyof ApplicationWizardInput)[]));
    if (!valid) return;
    persistCurrentValues();
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function goBack() {
    persistCurrentValues();
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleSaveAndExit() {
    persistCurrentValues();
    router.push("/dashboard/applications");
  }

  function onSubmitFinal(values: ApplicationWizardValues) {
    if (!applicationId) return;
    updateApplication(applicationId, {
      applicant: { name: values.name, email: values.email, phone: values.phone || undefined },
      childId: values.childId,
      learningInterests: values.learningInterests,
      message: values.message,
    });
    const result = submit(applicationId);
    if (result) setSubmittedApplication(result);
  }

  if (!childrenReady || !ready) {
    return <Section className="min-h-[60vh]" />;
  }

  if (children.length === 0) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <EmptyState
            icon={ClipboardList}
            title="Add a child profile first"
            description="An application is linked to one of your children — add their profile before starting one."
            action={
              <Button size="sm" asChild>
                <Link href="/dashboard">Go to your dashboard</Link>
              </Button>
            }
          />
        </Container>
      </Section>
    );
  }

  if (submittedApplication) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center py-16">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-100 text-success-700">
            <Check className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            Application submitted
          </Heading>
          <p className="mt-3 text-neutral-600">
            Your reference number is <span className="font-semibold text-ink">{submittedApplication.referenceNumber}</span>.
            Keep it handy — you can use it to find this application again.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            There&apos;s no live admissions review connected yet, so this stays at &ldquo;Submitted&rdquo; for now — nothing
            is being reviewed or decided automatically.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={`/dashboard/applications/${submittedApplication.id}`}>View your application</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to your dashboard</Link>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  const values = getValues();
  const selectedChild = children.find((child) => child.id === values.childId);
  const selectedCategories = getAllLearningCategories().filter((category) => values.learningInterests?.includes(category.slug));
  const currentStep = STEPS[stepIndex];

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Applications", href: "/dashboard/applications" },
          { label: "New application" },
        ]}
        eyebrow="Admissions"
        title="Start an application"
        description="A few short steps — save and come back anytime before you submit."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl">
          <ApplicationProgress currentIndex={stepIndex} />

          <Card className="mt-8 p-6 sm:p-8">
            <Heading level="h3" as="h2">
              {currentStep.title}
            </Heading>
            <p className="mt-1 text-sm text-neutral-600">{currentStep.description}</p>

            <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmitFinal)}>
              {currentStep.key === "applicant" && (
                <>
                  <div>
                    <Label htmlFor="applicant-name">
                      Full name
                      <RequiredMark />
                    </Label>
                    <Input id="applicant-name" invalid={!!errors.name} {...register("name")} />
                    {errors.name && <p className="mt-1.5 text-sm text-error-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="applicant-email">
                      Email address
                      <RequiredMark />
                    </Label>
                    <p className="mb-1.5 text-xs text-neutral-500">We&apos;ll use this to keep this application linked to you.</p>
                    <Input id="applicant-email" type="email" invalid={!!errors.email} {...register("email")} />
                    {errors.email && <p className="mt-1.5 text-sm text-error-600">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="applicant-phone">Phone number (optional)</Label>
                    <Input id="applicant-phone" type="tel" invalid={!!errors.phone} {...register("phone")} />
                    {errors.phone && <p className="mt-1.5 text-sm text-error-600">{errors.phone.message}</p>}
                  </div>
                </>
              )}

              {currentStep.key === "learner" && (
                <div>
                  <Label htmlFor="learner-child">
                    Child
                    <RequiredMark />
                  </Label>
                  <p className="mb-1.5 text-xs text-neutral-500">
                    Only your own child profiles are listed here.{" "}
                    <Link href="/dashboard" className="font-medium text-primary-700 hover:underline">
                      Add another child
                    </Link>{" "}
                    from your dashboard first if you don&apos;t see who you&apos;re looking for.
                  </p>
                  <Select id="learner-child" invalid={!!errors.childId} {...register("childId")}>
                    <option value="">Choose a child</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} ({child.ageYears} years old)
                      </option>
                    ))}
                  </Select>
                  {errors.childId && <p className="mt-1.5 text-sm text-error-600">{errors.childId.message}</p>}
                </div>
              )}

              {currentStep.key === "interests" && (
                <fieldset>
                  <legend className="sr-only">Learning interests</legend>
                  <p className="mb-2 text-xs text-neutral-500">Choose at least one — pick as many as apply.</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {getAllLearningCategories().map((category) => (
                      <label
                        key={category.slug}
                        className={cn(
                          "flex cursor-pointer items-center justify-center rounded-md border border-neutral-300 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors",
                          "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-800",
                          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
                        )}
                      >
                        <input type="checkbox" value={category.slug} className="sr-only" {...register("learningInterests")} />
                        {category.name}
                      </label>
                    ))}
                  </div>
                  {errors.learningInterests && (
                    <p className="mt-1.5 text-sm text-error-600">{errors.learningInterests.message}</p>
                  )}
                </fieldset>
              )}

              {currentStep.key === "additional" && (
                <div>
                  <Label htmlFor="additional-message">Anything else you&apos;d like to share (optional)</Label>
                  <Textarea
                    id="additional-message"
                    rows={5}
                    placeholder="Questions, scheduling notes, or anything that would help — entirely optional."
                    invalid={!!errors.message}
                    {...register("message")}
                  />
                  {errors.message && <p className="mt-1.5 text-sm text-error-600">{errors.message.message}</p>}
                </div>
              )}

              {currentStep.key === "review" && (
                <div className="space-y-6">
                  <section>
                    <div className="flex items-center justify-between">
                      <Heading level="h4" as="h3" className="text-neutral-500">
                        Applicant
                      </Heading>
                      <button type="button" onClick={() => setStepIndex(0)} className="text-sm font-medium text-primary-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-ink">{values.name}</p>
                    <p className="text-sm text-neutral-600">{values.email}</p>
                    {values.phone && <p className="text-sm text-neutral-600">{values.phone}</p>}
                  </section>

                  <section className="border-t border-neutral-200 pt-6">
                    <div className="flex items-center justify-between">
                      <Heading level="h4" as="h3" className="text-neutral-500">
                        Learner
                      </Heading>
                      <button type="button" onClick={() => setStepIndex(1)} className="text-sm font-medium text-primary-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-ink">
                      {selectedChild ? `${selectedChild.name} (${selectedChild.ageYears} years old)` : "Not selected yet"}
                    </p>
                  </section>

                  <section className="border-t border-neutral-200 pt-6">
                    <div className="flex items-center justify-between">
                      <Heading level="h4" as="h3" className="text-neutral-500">
                        Learning interests
                      </Heading>
                      <button type="button" onClick={() => setStepIndex(2)} className="text-sm font-medium text-primary-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedCategories.length > 0 ? (
                        selectedCategories.map((category) => (
                          <Badge key={category.slug} variant="neutral">
                            {category.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">None selected yet</p>
                      )}
                    </div>
                  </section>

                  <section className="border-t border-neutral-200 pt-6">
                    <div className="flex items-center justify-between">
                      <Heading level="h4" as="h3" className="text-neutral-500">
                        Additional information
                      </Heading>
                      <button type="button" onClick={() => setStepIndex(3)} className="text-sm font-medium text-primary-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink">{values.message || "Nothing added"}</p>
                  </section>

                  <p className="rounded-md bg-neutral-100 px-3.5 py-2.5 text-xs text-neutral-600">
                    There&apos;s no live admissions review connected yet — submitting saves this application here with a
                    real reference number, but no one is notified and nothing is reviewed automatically.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-6">
                <button type="button" onClick={handleSaveAndExit} className="text-sm font-medium text-neutral-600 hover:text-ink hover:underline">
                  Save &amp; exit
                </button>
                <div className="flex gap-3">
                  {stepIndex > 0 && (
                    <Button type="button" variant="outline" onClick={goBack}>
                      Back
                    </Button>
                  )}
                  {currentStep.key === "review" ? (
                    <Button type="submit" isLoading={isSubmitting}>
                      Submit application
                    </Button>
                  ) : (
                    <Button type="button" onClick={goNext}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { ApplicationWizard };
