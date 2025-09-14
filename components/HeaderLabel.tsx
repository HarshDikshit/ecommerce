import React from 'react'
interface Props{
    title: string;
    subtitle: string;
    slug: string;
}


function HeaderLabel({title, subtitle, slug}: Props) {
  return (
    <div>
        <div className='flex relative text-center mb-6 justify-center items-center w-full gap-4'>
                  <img
                          src='/heading-element.png'
                          alt={'Decorative Element'}
                          className="category-image w-24 object-fill justify-center items-center  hover:scale-105 transition-transform duration-600"
                        />
                        <div className='text-1xl flex text-center justify-center items-center my-auto uppercase font-semibold text-[var(--maroon)] '>{slug}</div>
                  <img
                          src='/heading-element.png'
                          alt={'Decorative Element'}
                          className="category-image  w-24 object-cover hover:scale-105 transition-transform duration-600"
                        />
                </div>
                <h2 className="text-5xl lg:text-5xl  text-center mb-3 text-black">{title}</h2>
                <p className='text-lg  text-black/70 text-center font-[Playfair+Display] mb-2'>{subtitle}</p>
    </div>
  )
}

export default HeaderLabel