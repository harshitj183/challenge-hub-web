import Sidebar from "@/components/Sidebar";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>
            <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        .main-content {
          margin-left: 320px;
          flex: 1;
          padding: 20px 0;
        }
        
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 280px;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding: 80px 0 20px 0;
          }
        }
      `}</style>
        </div>
    );
}
