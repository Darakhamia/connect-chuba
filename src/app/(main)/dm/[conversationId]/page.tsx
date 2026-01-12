import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DMChatArea } from "@/components/dm/dm-chat-area";

interface DMPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function DMPage({ params }: DMPageProps) {
  const { conversationId } = await params;
  const profile = await currentProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  // Получаем беседу
  const conversation = await db.dMConversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      profileOne: true,
      profileTwo: true,
    },
  });

  if (!conversation) {
    redirect("/");
  }

  // Проверяем что пользователь участник беседы
  if (conversation.profileOneId !== profile.id && conversation.profileTwoId !== profile.id) {
    redirect("/");
  }

  // Определяем собеседника
  const otherProfile = conversation.profileOneId === profile.id
    ? conversation.profileTwo
    : conversation.profileOne;

  return (
    <DMChatArea
      conversationId={conversation.id}
      currentProfile={profile}
      otherProfile={otherProfile}
    />
  );
}
