// components/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import ProtectPage from "./protect";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ProtectPage>{children}</ProtectPage>
      </QueryClientProvider>
    </SessionProvider>
  );
}

// "use client";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useState } from "react";
// import { SessionProvider } from "next-auth/react";

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 60 * 1000,
//           },
//         },
//       })
//   );

//   return (
//     <SessionProvider>
//       <QueryClientProvider client={queryClient}>
//         {children} {/* 直接渲染 children，不包裹 ProtectPage */}
//       </QueryClientProvider>
//     </SessionProvider>
//   );
// }
