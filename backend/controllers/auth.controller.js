import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


// Signup endpoint
export const signup = async (req, res) => {
  try {
    const { username, fullname, password, email } = req.body;
    console.log("Request Body: ", req.body);

    // Check if all fields are provided
    if (!username || !fullname || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Fixed this condition
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check for existing username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check for existing email
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Ensured 'password' is valid
    console.log("hashed password: ", hashedPassword);

    // Create new user
    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,
      email,
    });

    // Save user and generate token
    await newUser.save();
    await generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      followers: newUser.followers || [],
      following: newUser.following || [],
      profileImg: newUser.profileImg || "",
      coverImg: newUser.coverImg || "",
    });
  } catch (error) {
    console.error("Error in signup function: ", error);
    res.status(500).json({ error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Request Body: ", req.body);
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isPassswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    ); //if this is not defined,it will throw an error - atleast an empty string will be returned
    if (!isPassswordCorrect) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);
    res.json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers || [],
      following: user.following || [],
      profileImg: user.profileImg || "",
      coverImg: user.coverImg || "",
    });
  } catch (error) {
    console.error("Error in login function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  try{
    res.clearCookie("jwt","",{maxAge: 0, secure: false, sameSite: "strict"  });
    res.status(200).json({ message: "Logged out successfully" });
  }
  catch(error){
    console.error("Error in logout function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"  );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({user});
  } catch (error) {
    console.error("Error in getMe function: ", error);
    res.status(500).json({ error: error.message });
  }
};
