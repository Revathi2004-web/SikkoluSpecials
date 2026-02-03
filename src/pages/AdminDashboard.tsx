import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sikkolu Specials Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Welcome to your dashboard, Mawa! Manage your items here.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Inventory</h2>
          <Button onClick={() => alert("Add Product feature coming soon!")}>Add New Product</Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? products.map((product: any) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Active</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No products found. Add some in Supabase!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; // Build error rakunda idi must!
