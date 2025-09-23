import Footer from "@/components/Footer";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavbarItems from "@/components/NavItems";
// import Navbar from "@/components/Navbar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useEffect(() => {
  //     fetch('/api/init', { method: 'POST' }).then((res) => res.json())
  //       .then((data) => console.log(data));
  //   }, []);
  
  return (
    <ClerkProvider>
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <NavbarItems/>
      <main className="flex-1">{children}</main>
      <Footer/>
    </div>
    </ClerkProvider>
  );
}
