import { getAllCategories } from "@/sanity/queries";
import Link from "next/link";


export default async function CategorySlider() {
  // const [categories, setCategories] = useState<any[]>([]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     const data = await client.fetch(categoryQuery);
  //     setCategories(data);
  //   };
  //   fetchCategories();
  // }, []);

  const categories = await getAllCategories();

  return (
    <div className="w-full py-10">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-tight">
        Shop by Category
      </h2>

      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto no-scrollbar pb-6">
        <div
          className="
            flex space-x-14 px-10
            snap-x snap-mandatory
          "
        >
          {categories?.map((cat: any) => (
            <Link href={`/shop/?category=${cat?._id}`}>
            <div
              key={cat._id}
              className="flex flex-col items-center text-center w-[140px] snap-start"
            >
              {/* Image Wrapper for Zoom Effect */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="
                      w-full h-full object-cover
                      transform transition-transform duration-3000 ease-in-out
                      hover:scale-120
                    "
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#800000] text-white text-2xl">
                    {cat.title.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title */}
              <p className="mt-4 text-slate-700 font-light tracking-wide text-base">
                {cat.title}
              </p>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
