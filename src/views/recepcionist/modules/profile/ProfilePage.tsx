// src/views/recepcionist/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Usuario Vergel",
        email: "usuario@vergel.com",
        phone: "(01) 456-7892",
        document: "45678912",
        address: "Av. Siempre Viva 742, Miraflores, Lima",
        role: "Recepcionista",
      }}
    />
  );
}
