import { LogoutButton } from "@/components/auth/LogoutButton";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadOnboardingData } from "@/lib/onboarding/data";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [data, params] = await Promise.all([
    loadOnboardingData(supabase, user.id),
    searchParams,
  ]);

  if (!data.errorMessage && !data.profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        description="Cambia tu oposición, la fecha del examen y el tiempo que tienes para estudiar."
        title="Ajustes"
      />

      {params.guardado === "1" ? (
        <p
          className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800"
          role="status"
        >
          Cambios guardados.
        </p>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Tu oposición</h2>
        <p className="mt-1 mb-6 text-sm leading-6 text-slate-600">
          Si cambias de especialidad verás el temario de la nueva. Lo que
          tenías marcado en la anterior se conserva por si vuelves.
        </p>
        {data.errorMessage ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            No se pudieron cargar tus ajustes: {data.errorMessage}
          </p>
        ) : (
          <OnboardingForm
            autonomousCommunities={data.autonomousCommunities}
            educationStages={data.educationStages}
            mode="settings"
            profile={data.profile}
            specialties={data.specialties}
          />
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Tu cuenta</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Has iniciado sesión como {user.email}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button href="/reset-password" variant="secondary">
            Cambiar contraseña
          </Button>
          <LogoutButton />
        </div>
      </Card>
    </div>
  );
}
