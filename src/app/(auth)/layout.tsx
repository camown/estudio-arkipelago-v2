export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-main p-4 font-mono text-text-main">
      {children}
    </div>
  );
}

