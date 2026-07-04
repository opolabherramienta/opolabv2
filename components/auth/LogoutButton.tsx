import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button className="w-full" type="submit" variant="secondary">
        Cerrar sesion
      </Button>
    </form>
  );
}
