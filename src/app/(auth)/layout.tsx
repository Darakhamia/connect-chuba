export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1f22] via-[#2b2d31] to-[#1e1f22]">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle,rgba(88,101,242,0.15)_0%,transparent_50%)]" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,rgba(87,242,135,0.1)_0%,transparent_50%)]" />
      </div>
      
      {/* Контент */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

