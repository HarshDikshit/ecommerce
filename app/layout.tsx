import RazorpayScript from "@/components/RazorpayScript";
import "./globals.css";
import { Toaster } from "react-hot-toast";


const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`font-poppins antialiased`} suppressHydrationWarning={true}>
        {children}
        <RazorpayScript/>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#000000",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;
