export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] p-4 font-mono text-[#FAFAFA]">
      {children}
    </div>
  );
}
