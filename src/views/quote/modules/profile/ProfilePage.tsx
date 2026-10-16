// src/views/quote/modules/profile/ProfilePage.tsx
import ProfileView from "../../../../components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <ProfileView
      initialData={{
        name: "Cotizador Vergel",
        email: "cotizador@vergel.com",
        phone: "(01) 456-7894",
        document: "45678915",
        address: "Av. Benavides 498, Miraflores, Lima",
        role: "Cotizador",
      }}
    />
  );
}
