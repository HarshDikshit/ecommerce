import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Divine Gems E-commerce',
  description: 'Spiritual gemstones and accessories',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <html lang="en">
        <body className={`font-poppins antialiased`}>
            {children}
        </body>
    </html>
  );
}

export default RootLayout;