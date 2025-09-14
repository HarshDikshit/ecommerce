'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProduct() {
  const [product, setProduct] = useState({
    name: '', description: '', variant: '', category: '', price: 0, discount: 0, stock: 0, images: [] as string[],
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/admin/check-auth');
      if (!res.ok) router.push('/admin');
    };
    checkAuth();
    fetchProduct();
  }, [router, id]);

  const fetchProduct = async () => {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    setProduct(data);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify(product));
    newImages.forEach((file) => formData.append('images', file));

    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      body: formData,
    });
    if (res.ok) {
      router.push('/admin/dashboard');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: updatedImages });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl mb-6">Edit Product</h1>
      <form onSubmit={handleUpdateProduct} className="admin-form">
        <input
          type="text"
          placeholder="Name"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="admin-input"
        />
        <textarea
          placeholder="Description"
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          className="admin-input"
        />
        <label htmlFor='variant' className="text-sm mb-1">Variant</label>
        <select
        id='variant'
          value={product.variant}
          onChange={(e) => setProduct({ ...product, variant: e.target.value })}
          className="admin-input"
        >
          <option value="">Select Variant</option>
          <option value="mala">Mala</option>
          <option value="bracelet">Bracelet</option>
          <option value="gemstone">Gemstone</option>
          <option value="rudraksha">Rudraksha</option>
        </select>
        <input
          type="text"
          placeholder="Category (optional)"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
          className="admin-input"
        />
        <input
          type="number"
          placeholder="Price"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
          className="admin-input"
        />
        <input
          type="number"
          placeholder="Discount (%)"
          value={product.discount}
          onChange={(e) => setProduct({ ...product, discount: Number(e.target.value) })}
          className="admin-input"
        />
        <input
          type="number"
          placeholder="Stock"
          value={product.stock}
          onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
          className="admin-input"
        />
        <div className="mb-4">
          <h3 className="text-lg mb-2">Existing Images</h3>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt="Product" className="w-full h-24 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        <label htmlFor='images' className="text-sm mb-1">Images</label>
        <input
            id='images'
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setNewImages(Array.from(e.target.files || []))}
          className="admin-input"
        />
        <button type="submit" className="admin-button">Update Product</button>
      </form>
    </div>
  );
}