import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaEdit, FaTrash,  } from "react-icons/fa";


const Products = () => {
  const categories = ["Women's", "Men's", "Footwear", "Accessories", "Kids"];
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    supplier: "",
    imageUrl: ""// Added imageUrl field
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    axios.get("${import.meta.env.VITE_API_BASE_URL}/products")
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    axios.get("${import.meta.env.VITE_API_BASE_URL}/suppliers")
      .then(response => setSuppliers(response.data))
      .catch(error => console.error("Error fetching suppliers:", error));
  }, []);

 

  const openModal = (product = null) => {
    if (product) {
      setIsEditMode(true);
      setCurrentProduct(product);
      setNewProduct({
        ...product,
        supplier: product.supplier ? parseInt(product.supplier) : "" // Handle both new and existing products
      });
    } else {
      setIsEditMode(false);
      setNewProduct({ name: "", category: "", price: "", quantity: "", supplier: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewProduct({ name: "", category: "", price: "", quantity: "", supplier: "", imageUrl: "" });
    setCurrentProduct(null);
    setSelectedImage(null);
    setUploadStatus("");
  };

const handleChange = (e) => {
  const { name, value } = e.target;
  setNewProduct({
    ...newProduct,
    [name]: name === "supplier" ? parseInt(value) : value
  });
};
  
  // Handle image file selection
  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  // Handle image upload to Cloudinary
  const uploadImage = async () => {
    if (!selectedImage) {
      setUploadStatus('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('upload_preset', 'my_upload_preset');
    
    try {
      setUploadStatus('Uploading...');
      
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dg5ceys50/image/upload',
        formData
      );

      setUploadStatus('Upload successful!');
      setNewProduct({ ...newProduct, imageUrl: response.data.secure_url });
      setSelectedImage(null);
    } catch (error) {
      setUploadStatus('Upload failed: ' + error.message);
      console.error('Error uploading image:', error);
    }
  };

  const addProduct = () => {
    axios.post("${import.meta.env.VITE_API_BASE_URL}/products", newProduct)
      .then(response => setProducts([...products, response.data]))
      .catch(error => console.error("Error adding product:", error));
    closeModal();
  };

  const updateProduct = () => {
    const updatedProduct = {
      ...newProduct,
      supplier: parseInt(newProduct.supplier) // Ensure supplier is a number
    };
    
    axios.put(`${import.meta.env.VITE_API_BASE_URL}/products/${currentProduct.id}`, updatedProduct)
      .then(response => {
        setProducts(products.map(product => 
          product.id === currentProduct.id ? response.data : product
        ));
      })
      .catch(error => console.error("Error updating product:", error));
    closeModal();
  };

  const deleteProduct = (id) => {
    axios.delete(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`)
      .then(() => setProducts(products.filter(product => product.id !== id)))
      .catch(error => console.error("Error deleting product:", error));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.id.toString().includes(searchQuery) 
  );

  const getSupplierName = (supplierId) => {
    if (!supplierId) return 'Unknown Supplier';
    const supplier = suppliers.find(s => s.id === parseInt(supplierId));
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const displayedProducts = filteredProducts.filter(product => {
    const matchesSearch = product.id.toString().includes(searchQuery);
  
    if (filter === "Available") return matchesSearch && product.quantity >= 5;
    if (filter === "Limited") return matchesSearch && product.quantity > 0 && product.quantity < 5;
    if (filter === "Out of Stock") return matchesSearch && product.quantity <= 0;
  
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Product List</h2>
        <div className="relative ">
            <input
              type="text"
              placeholder="Search by Product ID"
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2 pr-10 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">
          + Add Product
        </button>
      </div>

      <div className="p-6">
        <div className="flex space-x-4 mb-4">
          {["All", "Available", "Limited", "Out of Stock"].map(status => (
            <button
              key={status}
              className={`px-4 py-2 ${filter === status ? "border-b-2 border-blue-500" : "border-b-2 border-gray-300"} text-gray-800 focus:outline-none`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <table className="w-full text-left bg-white border-collapse rounded-lg">
          <thead className="bg-gray-50">
            <tr className="px-6 py-3 text-justify text-sm font-medium text-gray-500 uppercase tracking-wider">
              <th className="p-4"><input type="checkbox" /></th>
              <th className="p-4">ID</th>
              <th className="p-4"></th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Quantity</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.length > 0 ? (
              displayedProducts.map(product => (
                <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </td>
                  <td className="p-4">{product.id}</td>
                  <td className="p-4"><img src={product.imageUrl} alt="" className="w-24" /></td>
                  <td className="p-4 ">{product.name}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">Rs. {product.price}</td>
                  <td className="p-4 text-center">{product.quantity}</td>
                  <td className="p-4">{getSupplierName(product.supplier)}</td>
                  <td className={`p-4 font-semibold ${product.quantity <= 0 ? "text-red-600" : product.quantity < 5 ? "text-yellow-500" : "text-green-600"}`}>
                              {product.quantity <= 0 ? "Out of Stock" : product.quantity < 5 ? "Limited Quantity" : "Available"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-3">
                      <button onClick={() => openModal(product)} className="text-yellow-600 hover:text-yellow-900" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">No products found</td>
              </tr> 
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">{isEditMode ? "Update Product" : "Add New Product"}</h3>
            <div className="space-y-2">
              <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleChange} className="w-full p-2 border rounded-md" />
              <select
                name="category"
                value={newProduct.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleChange} className="w-full p-2 border rounded-md" />
              <input type="number" name="quantity" placeholder="Quantity" value={newProduct.quantity} onChange={handleChange} className="w-full p-2 border rounded-md" />
              <select
                  name="supplier"
                  value={newProduct.supplier}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              <div className="w-full">
                <label
                  htmlFor="imageUpload"
                  className="flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition duration-200"
                >
                  <svg
                    className="w-6 h-6 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                  <span className="text-gray-600">Click to upload image</span>
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {selectedImage && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {selectedImage.name}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={uploadImage}
                disabled={!selectedImage}
                className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Upload Image
              </button>
              {uploadStatus && <p className="text-sm">{uploadStatus}</p>}
              {newProduct.imageUrl && (
                <p className="text-sm text-green-600">Image uploaded successfully!</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-400 rounded-md">Cancel</button>
              <button onClick={isEditMode ? updateProduct : addProduct} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700">{isEditMode ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;