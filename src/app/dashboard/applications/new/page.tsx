import type { Metadata } from "next";
import { ApplicationWizard } from "@/components/patterns/application-wizard";

export const metadata: Metadata = {
  title: "New Application",
  description: "Start or continue an application on Little Learners Learning.",
  robots: { index: false, follow: false },
};

export default async function NewApplicationPage({
  searchParams,
}: PageProps<"/dashboard/applications/new">) {
  const params = await searchParams;
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  return <ApplicationWizard initialApplicationId={id} />;
}
