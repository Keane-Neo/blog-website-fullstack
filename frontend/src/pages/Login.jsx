import React from "react";
import Header from "../components/Header";

const Login = () => {
  return (
    <div className="relative h-screen">
      <Header />
      <h1>Login</h1>
      <form method="post">
        <input
          type="email"
          name="email"
          required
          aria-required
          placeholder="Enter your email"
        >
          Email:
        </input>
        <input type="password" name="password" required aria-required>
          Password:
        </input>
        <input type="submit" name="login">
          Login
        </input>
      </form>
      <h2>New User?</h2>
      <button type="submit" name="signup">
        Sign Up
      </button>
    </div>
  );
};

export default Login;
