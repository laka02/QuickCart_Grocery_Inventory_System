import { useState } from 'react';
import axios from 'axios';

const ProductForm = ({ setView, setProducts }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    supplier: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/products', formData);
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(response.data);
      setView('list');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Create New Product</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          style={inputStyle}
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          style={inputStyle}
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          min="0"
          step="0.01"
          required
        />
        <input
          style={inputStyle}
          type="number"
          placeholder="Stock"
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: e.target.value})}
          min="0"
          required
        />
        <button type="submit" style={submitButtonStyle}>
          Save Product
        </button>
      </form>
    </div>
  );
};

// Basic styling
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '400px'
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ddd'
};

const submitButtonStyle = {
  padding: '10px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default ProductForm;