// "use client";
//
// import { useSession } from "next-auth/react";
// import { useRouter, usePathname } from "next/navigation"; // Import usePathname for accessing current route
// import { useEffect } from "react";
//
// export function withAuth(WrappedComponent: React.ComponentType) {
//     return function AuthenticatedComponent(props: any) {
//         const {  status } = useSession();
//         const router = useRouter();
//         const pathname = usePathname(); // Get current route
//         const unprotectedPaths: string[] = ["/auth/login", "/auth/register"];
//
//         useEffect(() => {
//             // Skip auth checks if pathname is null or for unprotected paths
//             if (!pathname || unprotectedPaths.includes(pathname)) return;
//
//             if (status === "unauthenticated") {
//                 router.push("/auth/login");
//             }
//         }, [status, pathname, router]);
//
//         if (status === "loading") {
//             return <div>Loading...</div>;
//         }
//
//         return <WrappedComponent {...props} />;
//     };
// }