// src/views/admin/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Admin Vergel",
        email: "admin@vergel.com",
        phone: "(01) 456-7890",
        document: "40125478",
        address: "Av. Primavera 1280, Of. 402 - Santiago de Surco, Lima",
        role: "Administrador",
      }}
    />
  );
}
