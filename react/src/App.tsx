import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateProduct from './AddProduct';
import ViewProducts from './ViewProducts';

function App() {
  return (
    <div className="App">
      <Router>
        <div className='header'>
          <Link className='link' to="/create">Add Product</Link>
          <Link className='link' to="/view">View Products</Link>
        </div>
        <Routes>
          <Route path="/create" element={<CreateProduct />} />
          <Route path="/view" element={<ViewProducts />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
