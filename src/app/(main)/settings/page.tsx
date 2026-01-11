import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { SettingsPage } from "@/components/settings/settings-page";

export default async function Settings() {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  return <SettingsPage profile={profile} />;
}
