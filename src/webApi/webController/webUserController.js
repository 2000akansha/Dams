import jwt from "jsonwebtoken";
import User from "../webModel/webUserDetails.js";
import bcrypt from "bcrypt";

// Helper function to create a token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

// Login user
const loginUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Username, password and role are required",
    });
  }

  try {
    const user = await User.login(username, password, role);

    // Create token with the role
    const token = createToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Logged In Successfully",
      user: {
        name: user.name,
        username: username,
        id: user._id,
        role: user.role,
        token: token,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Signup user
const signupUser = async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password || !role) {
    return res.status(400).json({
      error: "Name, phoneNumber, username, password, and role are required.",
    });
  }

  try {
    // Create the user
    const user = await User.signup(name, username, password, role);

    // Create a token with the role
    const token = createToken(user._id, user.role);

    res
      .status(200)
      .json({ userid: user._id, name, username, role: user.role, token });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    user.password = hash;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { loginUser, signupUser, changePassword };
