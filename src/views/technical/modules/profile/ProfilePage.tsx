// src/views/technical/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Técnico Vergel",
        email: "tecnico@vergel.com",
        phone: "987 654 321",
        document: "45678913",
        address: "Av. Universitaria 1200, San Miguel, Lima",
        role: "Técnico de Campo",
      }}
    />
  );
}
