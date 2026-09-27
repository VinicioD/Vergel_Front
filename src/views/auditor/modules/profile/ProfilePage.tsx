// src/views/auditor/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Auditor Vergel",
        email: "auditor@vergel.com",
        phone: "(01) 456-7893",
        document: "45678914",
        address: "Av. Arequipa 3255, San Isidro, Lima",
        role: "Auditor",
      }}
    />
  );
}
