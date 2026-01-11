import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn 
      appearance={{
        elements: {
          formButtonPrimary: 
            "bg-[#5865f2] hover:bg-[#4752c4] text-white",
          card: "bg-[#313338] border-[#3f4147]",
          headerTitle: "text-white",
          headerSubtitle: "text-[#949ba4]",
          socialButtonsBlockButton: 
            "bg-[#2b2d31] border-[#3f4147] text-white hover:bg-[#35373c]",
          formFieldLabel: "text-[#b5bac1]",
          formFieldInput: 
            "bg-[#1e1f22] border-[#3f4147] text-white focus:border-[#5865f2]",
          footerActionLink: "text-[#00a8fc] hover:text-[#00a8fc]/80",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-[#00a8fc]",
        },
      }}
    />
  );
}

