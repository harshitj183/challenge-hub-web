import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="app-container">
            <AdminSidebar />
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
      `}</style>
        </div>
    );
}
