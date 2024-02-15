const authService = require("../services/auth.service");
const jwtService = require("../services/jwt.service");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await authService.register({ name, email, password });

    console.log(newUser);

    res.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login({ email, password });
  const jwt = jwtService.sign({ _id: user._id, email });

  res.json({
    success: true,
    message: "User logged in successfully",
    user: {
      name: user.name,
      email: user.email,
      access_token: jwt,
    },
  });
};

module.exports = {
  register,
  login,
};
