import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
}

export default function CategoryCard({ title, image, link }: CategoryCardProps) {
  return (
    <div className="category-card p-1 flex flex-col justify-center  overflow-hidden shadow-sm shadow-slate-300">
      <Image
        src={image}
        alt={title}
        width={200}
        height={400}
        className="category-image mx-auto flex object-cover overflow-hidden  w-full h-90 hover:scale-105 transition-transform  duration-600"
      />
      <div className="p-4">
        <h3 className="font-poppins font-extralight text-black">{title}</h3>
        <Link href={link}>
          <button className="explore-button text-[var(--maroon)] underline">Explore Now</button>
        </Link>
      </div>
    </div>
  );
}