import { requireAuth } from "@/lib/auth";
import UserAudioLibrary from "@/components/user-audio-library";

export default async function AudiosPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <UserAudioLibrary />
    </div>
  );
}