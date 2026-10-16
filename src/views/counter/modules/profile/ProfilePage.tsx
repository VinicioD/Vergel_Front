// src/views/counter/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Contador Vergel",
        email: "contador@vergel.com",
        phone: "(01) 456-7895",
        document: "45678916",
        address: "Av. Javier Prado Este 4200, Surco, Lima",
        role: "Contador",
      }}
    />
  );
}
