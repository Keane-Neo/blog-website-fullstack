import React from "react";

const Header = () => {
  return (
    <header className="w-screen h-12 bg-slate-600 sticky top-0 flex align-middle justify-end">
      <h1>Blogging Website</h1>
      <nav className="flex items-center justify-between w-1/12 mr-2">
        <a href="#">Home</a>
        <a href="Login.jsx">Login</a>
      </nav>
    </header>
  );
};

export default Header;
