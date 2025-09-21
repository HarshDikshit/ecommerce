
import Hero from '@/components/Hero';
import FlowingLabels from '@/components/FlowingLabels';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import CategorySlider from '@/components/CategorySlider';
import Products from '@/components/Products';
import { getAllSlides, getGalleryProducts, getProducts } from '@/sanity/queries';
import GalleryCollage from '@/components/GalleryCollage';
import PurposeStrip from '@/components/PurposeStrip';

export interface Product {
  _id: string;
  name: string;
  description: string;
  variant: string;
  price: number;
  stock: number;
  status: string;
  discount: number; 
  images: string[];
}


export default async function Home() {
  const slides: any = await getAllSlides();
  const products: Product[] | any  = await getProducts(8);
  const newArrivalProducts: any  = await getProducts(8, {status: ["New Arrival"]});
  const galleryProducts: any = await getGalleryProducts(8);
  
  return (
    <main className="relative ">
      {/* Hero Section (unchanged) */}
      <Hero slides={slides}/>

      {/* strip floating labels */}
      <FlowingLabels/>

      {/* Categories Section */}
    <Container>
      <CategorySlider/>
      <div className='text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight'>Shop through Best Sellers</div>
        <Products products={products}/>
      </Container>

      <Container  className='bg-slate-200 relative'>
        <GalleryCollage products={galleryProducts}/>
      </Container>

      <Container>
        <div className='text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight'>New Arrivals For You</div>
        <Products products={newArrivalProducts}/>
      </Container>

      <Container className='bg-[#2A2438]'>
        <PurposeStrip/>
      </Container>
    </main>
       
  );
}
