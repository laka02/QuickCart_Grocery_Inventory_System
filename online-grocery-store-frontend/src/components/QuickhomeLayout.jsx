import React from "react";

const QuickhomeLayout = ({ sidebar, children }) => (
  <div className="min-h-screen bg-gray-50 flex">
    {/* Sidebar */}
    <aside className="fixed top-0 left-0 h-full w-64 z-20 bg-blue-900 text-white">
      {sidebar}
    </aside>
    {/* Main Content */}
    <main className="flex-1 ml-64">
      {children}
    </main>
  </div>
);

export default QuickhomeLayout; 