'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', variant: '', category: '', price: 0, discount: 0, stock: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/admin/check-auth');
      if (!res.ok) router.push('/admin');
    };
    checkAuth();
    fetchProducts();
    fetchOrders();
  }, [router]);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('data', JSON.stringify(newProduct));
    images.forEach((file) => formData.append('images', file));

    const res = await fetch('/api/products', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      fetchProducts();
      setNewProduct({ name: '', description: '', variant: '', category: '', price: 0, discount: 0, stock: 0 });
      setImages([]);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl mb-6">Admin Dashboard</h1>

      {/* Add Product Form */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Add Product</h2>
        <form onSubmit={handleAddProduct} className="admin-form">
          <input
            type="text"
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="admin-input"
          />
          <textarea
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="admin-input"
          />
          <label htmlFor='variant' className="text-sm mb-1">Variant</label>
          <select
            id='variant'
            value={newProduct.variant}
            onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
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
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="admin-input"
          />
          <label htmlFor='price' className="text-sm mb-1">Price in INR</label>
          <input
          id='price'
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            className="admin-input"
          />
          <label htmlFor='discount' className="text-sm mb-1">Discount in %</label>
          <input
            id='discount'
            type="number"
            placeholder="Discount (%)"
            value={newProduct.discount}
            onChange={(e) => setNewProduct({ ...newProduct, discount: Number(e.target.value) })}
            className="admin-input"
          />
          <label htmlFor='stock' className="text-sm mb-1">Stock</label>
          <input
            id='stock'
            type="number"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
            className="admin-input"
          />
          <label htmlFor='images' className="text-sm mb-1">Images</label>
          <input
          id='images'
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="admin-input"
          />
          <button type="submit" className="admin-button">Add Product</button>
        </form>
      </section>

      {/* Product List (unchanged) */}
      <section className="mb-12">
        <h2 className="text-2xl mb-4">Products</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.variant}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <Link href={`/admin/products/${product._id}`} className="text-[var(--saffron)] mr-2">Edit</Link>
                  <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Order List (unchanged) */}
      <section>
        <h2 className="text-2xl mb-4">Orders</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id}>
                <td>{order.orderId}</td>
                <td>{order.userId.name}</td>
                <td>₹{order.total}</td>
                <td>{order.status}</td>
                <td>
                    <label htmlFor='status' className="text-sm mb-1 sr-only">Status</label>
                  <select
                  id='status'
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                    className="admin-input"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}