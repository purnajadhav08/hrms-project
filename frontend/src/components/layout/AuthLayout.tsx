import Footer from "./Footer";

interface Props { children: React.ReactNode; }

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #1a5276 100%)" }}>
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        {children}
      </div>
      <Footer />
    </div>
  );
}
