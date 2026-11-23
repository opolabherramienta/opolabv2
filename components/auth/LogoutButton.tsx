import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button className="w-full" type="submit" variant="ghost">
        Cerrar sesión
      </Button>
    </form>
  );
}
