import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Product from './pages/product';
import NewProduct from './pages/newProduct';
import Suppliers from './pages/suppliers';
import Login from './pages/Login';
import Profile from './pages/profile';
import Quickhome from './pages/Quickhome';
import Cart from './pages/Cart';
//import UserProfile from './pages/userProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Quickhome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Product />} />
          <Route path="newProduct" element={<NewProduct/>}/>
          <Route path="suppliers" element={<Suppliers />} />   
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


//          <Route path="UserProfile" element={<userProfile />} />
