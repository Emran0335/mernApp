import axios from "axios";

// Register User
const register = async (userData) => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/users/register",
    userData
  );
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Login User
const login = async (userData) => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/users/login",
    userData
  );
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

//Logout the User
const logout = async () => {
  localStorage.removeItem("user");
};

const authService = {
  register,
  logout,
  login,
};

export default authService;
