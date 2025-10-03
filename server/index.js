import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import bcrypt from "bcrypt";
import multer from "multer";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import path from "path"; // ADD THIS LINE
import { fileURLToPath } from "url";
const app = express();
const PORT = 8080;

// JWT Configuration
const JWT_SECRET = 'your-jwt-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);


// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





// Database connection
mongoose
   .connect("mongodb+srv://abimeversedeploy:12345@abimeversedeploy1.10myagz.mongodb.net/authapp?retryWrites=true&w=majority")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  user_name: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    sparse: true, // Allow null values for Google users
  },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer-not-to-say"],
  },
  profilePicture: { type: String },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isGoogleSignup: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: "",
  },
  downloadLinks: {
    type: String,
    default: "",
  },
  genres: [
    {
      type: String,
    },
  ],
  category: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new mongoose.Schema({
  commentId: { 
    type: Number, 
    unique: true,
    required: true 
  },
  postId: { 
    type: Number, 
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
});

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires after 5 minutes
});

// Define models
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);
const File = mongoose.model("File", fileSchema);
const OTP = mongoose.model("OTP", otpSchema);

// Session configuration (keeping for compatibility, but primary auth will be JWT)
app.use(
  session({
    secret: "123456",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://abimeversedeploy:12345@abimeversedeploy1.10myagz.mongodb.net/authapp?retryWrites=true&w=majority",
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "lax", // Important for cross-site requests
    },
  })
);

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('JWT verification failed:', err.message);
        return res.status(403).json({
          success: false,
          message: "Invalid or expired token"
        });
      }

      req.user = user;
      console.log('JWT verified for user:', user);
      next();
    });
  } else {
    console.log('No authorization header found');
    res.status(401).json({
      success: false,
      message: "Authorization header required. Please login first."
    });
  }
};

// Use JWT middleware for authentication
const requireAuth = authenticateJWT;

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."),
        false
      );
    }
  },
});

// Add this middleware to log session info for debugging
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  next();
});

// API Routes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "apnibhook@gmail.com",
    pass: "cqvm bfqe rpbw mfcp", // Your app password
  },
});

// Generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Forgot password - Send OTP
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist!",
      });
    }

    // Check if user signed up with Google
    if (user.isGoogleSignup) {
      return res.status(400).json({
        success: false,
        message:
          "This email is associated with a Google account. Please use Google Sign-In to access your account.",
      });
    }

    // Check if the same email exists for both regular and Google accounts
    const allUsersWithEmail = await User.find({ email });

    if (allUsersWithEmail.length > 1) {
      // If there are multiple accounts with the same email
      const hasGoogleAccount = allUsersWithEmail.some(
        (user) => user.isGoogleSignup
      );
      const hasRegularAccount = allUsersWithEmail.some(
        (user) => !user.isGoogleSignup
      );

      if (hasGoogleAccount && hasRegularAccount) {
        return res.status(409).json({
          success: false,
          message:
            "This email is associated with multiple accounts. Please try logging in with your username or use Google Sign-In.",
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({ email, otp });

    // Send OTP via email
    const mailOptions = {
      from: "apnibhook@gmail.com",
      to: email,
      subject: "Your OTP for Password Recovery",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP email",
        });
      }

      console.log("OTP email sent:", info.response);
      res.status(200).json({
        success: true,
        message: "OTP sent successfully!",
      });
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Verify OTP
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // Check if OTP has expired
    const now = new Date();
    const otpAge = now - otpRecord.createdAt;
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (otpAge > fiveMinutes) {
      await OTP.deleteOne({ email, otp }); // Clean up expired OTP
      return res.status(400).json({
        success: false,
        message: "OTP has expired!",
      });
    }

    // OTP is valid
    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Reset password
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match!",
      });
    }

    // Check if user exists and is not a Google signup
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Check if user signed up with Google
    if (user.isGoogleSignup) {
      return res.status(400).json({
        success: false,
        message:
          "This account was created with Google. Password reset is not allowed.",
      });
    }

    // Verify OTP again for security
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ email, otp });

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create user
app.post("/adduser", async (req, res) => {
  try {
    console.log("Received signup request:", req.body);

    // Check if username already exists (exact match)
    const existingUserByUsername = await User.findOne({
      user_name: req.body.user_name,
    });
    console.log("Existing user by username check result:", existingUserByUsername);

    if (existingUserByUsername) {
      console.log("Username already exists");
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Check if name already exists (case-insensitive)
    const existingUserByName = await User.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }
    });
    console.log("Existing user by name check result:", existingUserByName);

    if (existingUserByName) {
      console.log("Name already exists");
      return res.status(400).json({
        success: false,
        message: "A user with this name already exists. Please use a different name.",
      });
    }

    // Check if phone number already exists
    if (req.body.phone) {
      const existingUserByPhone = await User.findOne({ phone: req.body.phone });

      if (existingUserByPhone) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already associated with an existing account.",
        });
      }
    }

    // Check if email already exists (additional check for email field)
    if (req.body.email) {
      const existingUserByEmail = await User.findOne({ 
        email: { $regex: new RegExp(`^${req.body.email}$`, 'i') }
      });

      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: "This email is already associated with an existing account.",
        });
      }
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Password hashed successfully");

    // Generate a custom primary key
    console.log("Finding last user...");
    const lastUser = await User.findOne().sort({ userId: -1 });
    console.log("Last user found:", lastUser);

    let newUserId;
    if (lastUser && lastUser.userId) {
      newUserId = lastUser.userId + 1;
    } else {
      newUserId = 1; // Start with 1 if no users exist
    }

    console.log("New user ID:", newUserId);

    // Insert new user with hashed password and original username
    console.log("Creating new user object...");
    const newUser = new User({
      userId: newUserId,
      user_name: req.body.user_name,
      password: hashedPassword,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      profilePicture: req.body.profilePicture,
      isGoogleSignup: false,
      createdAt: new Date(),
    });

    console.log("Saving user to database...");
    await newUser.save();
    console.log("User saved successfully");

    res.status(201).json({
      success: true,
      message: "User created successfully. Please login.",
      userId: newUserId,
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Login - UPDATED with JWT
app.post("/login", async (req, res) => {
  try {
    console.log("Login attempt received:", {
      username: req.body.user_name,
    });

    const username = req.body.user_name;
    const password = req.body.password;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ user_name: username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if this is a Google account
    if (user.isGoogleSignup) {
      return res.status(401).json({
        success: false,
        message: "This account was created with Google. Please use Google Sign-In instead.",
      });
    }

    // Compare hashed password with input password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", username);
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId,
        username: user.user_name,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("Login successful for user:", user.user_name);
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.userId,
        name: user.name,
        user_name: user.user_name,
        email: user.email,
      },
      token: token, // Send JWT token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed due to server error",
      error: error.message,
    });
  }
});

// Google signup - UPDATED with JWT
app.post("/google-signup", async (req, res) => {
  try {
    const { name, email, picture, sub } = req.body;

    // Check if user already exists with this Google ID
    const existingUserByGoogleId = await User.findOne({ googleId: sub });

    if (existingUserByGoogleId) {
      // Generate JWT token for existing user
      const token = jwt.sign(
        { 
          userId: existingUserByGoogleId.userId,
          username: existingUserByGoogleId.user_name,
          email: existingUserByGoogleId.email,
          name: existingUserByGoogleId.name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          userId: existingUserByGoogleId.userId,
          name: existingUserByGoogleId.name,
          user_name: existingUserByGoogleId.user_name,
          email: existingUserByGoogleId.email,
        },
        token: token,
      });
    }

    // Check if email already exists in the database (check both formats)
    if (email) {
      // Check for original email format
      const existingUserByEmail = await User.findOne({ email: email });

      // Also check for modified email format (with @aniverse.com)
      const modifiedEmail = `${email}@aniverse.com`;
      const existingUserByModifiedEmail = await User.findOne({
        email: modifiedEmail,
      });

      if (existingUserByEmail || existingUserByModifiedEmail) {
        const existingUser = existingUserByEmail || existingUserByModifiedEmail;

        // If email exists but is not a Google account
        if (!existingUser.isGoogleSignup) {
          return res.status(409).json({
            success: false,
            message:
              "This email is already associated with a regular account. Please use your username and password to login, or use a different Google account.",
          });
        } else {
          // If email exists and is a Google account but with different Google ID
          return res.status(409).json({
            success: false,
            message:
              "This email is already associated with another Google account.",
          });
        }
      }
    }

    // Check if username already exists (create from email)
    const baseUsername = email
      ? email.split("@")[0]
      : `user_${sub.substring(0, 8)}`;
    let username = baseUsername;
    let counter = 1;

    // Find a unique username
    while (await User.findOne({ user_name: username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Generate a custom primary key
    const lastUser = await User.findOne().sort({ userId: -1 });
    const newUserId = lastUser ? lastUser.userId + 1 : 1;

    // Ensure email is not null or undefined - Google users use original email
    const userEmail = email || `${sub}@google.com`;

    // Insert new user with Google data and original email
    const newUser = new User({
      userId: newUserId,
      user_name: username,
      name: name,
      email: userEmail, // Google users keep original email format
      googleId: sub,
      profilePicture: picture,
      createdAt: new Date(),
      isGoogleSignup: true,
    });

    await newUser.save();

    // Generate JWT token for new user
    const token = jwt.sign(
      { 
        userId: newUserId,
        username: username,
        email: userEmail,
        name: name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        userId: newUserId,
        name: name,
        user_name: username,
        email: userEmail,
      },
      token: token,
    });
  } catch (error) {
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating user with Google",
      error: error.message,
    });
  }
});

// File Upload API - UPDATED with JWT
app.post("/file/upload", authenticateJWT, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Generate unique filename
    const filename = `${Date.now()}-${req.file.originalname}`;

    // Store file as binary in MongoDB
    const newFile = new File({
      filename: filename,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      size: req.file.size,
      uploadedAt: new Date(),
    });

    await newFile.save();

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      filename: filename,
      id: newFile._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
});

// File Download API
app.get("/file/:filename", async (req, res) => {
  try {
    const file = await File.findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set appropriate content type
    res.set("Content-Type", file.contentType);

    // Send binary data
    res.send(file.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving file",
      error: error.message,
    });
  }
});

// Counter model definition
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Create post endpoint - UPDATED with JWT
app.post("/createpost", authenticateJWT, async (req, res) => {
  try {
    console.log("Create post request received:", {
      user: req.user, // This comes from JWT middleware
      body: req.body,
    });

    // Get user from database using the userId from JWT
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Validate required fields
    const requiredFields = ["title", "description", "picture"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Get next post ID that will never repeat
    const newPostId = await getNextSequentialPostId();

    console.log("New post ID:", newPostId);

    // Create post object
    const postData = {
      postId: newPostId,
      title: req.body.title,
      description: req.body.description,
      picture: req.body.picture,
      downloadLinks: req.body.downloadLinks || "",
      genres: req.body.genres || [],
      category: req.body.category || "",
      createdAt: new Date(),
      userId: user._id, // Store only the user reference
    };

    // Insert new post
    const newPost = new Post(postData);
    await newPost.save();

    console.log("Post saved successfully:", newPostId);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      postId: newPostId,
      post: {
        postId: newPostId,
        title: req.body.title,
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Post ID conflict. Please try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating post",
      error: error.message,
    });
  }
});

// Function to get next sequential ID that never repeats
async function getNextSequentialPostId() {
  let attempt = 0;
  const maxAttempts = 10;
  
  while (attempt < maxAttempts) {
    try {
      // Get the highest postId ever used (including deleted ones)
      const lastPost = await Post.findOne().sort({ postId: -1 }).select('postId');
      const nextId = lastPost ? lastPost.postId + 1 : 1;
      
      // Check if this ID already exists (shouldn't happen, but safety check)
      const existingPost = await Post.findOne({ postId: nextId });
      if (!existingPost) {
        return nextId;
      }
      
      // If ID exists, try next one (this handles rare race conditions)
      attempt++;
    } catch (error) {
      console.error("Error in getNextSequentialPostId:", error);
      throw error;
    }
  }
  
  throw new Error("Failed to generate unique post ID after multiple attempts");
}

// Get all posts API
app.get("/posts", async (req, res) => {
  try {
    const { category } = req.query;

    let matchStage = {};
    if (category && category !== "All") {
      matchStage.category = category;
    }

    const posts = await Post.aggregate([
      // Match posts by category if specified
      { $match: matchStage },
      
      // Lookup to join with users collection
      {
        $lookup: {
          from: "users", // name of the users collection
          localField: "userId", // field in posts collection
          foreignField: "_id", // field in users collection
          as: "userData" // array containing matched user documents
        }
      },
      
      // Unwind the userData array to get a single object
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      
      // Project the fields we need
      {
        $project: {
          // Post fields
          postId: 1,
          title: 1,
          description: 1,
          picture: 1,
          genres: 1,
          category: 1,
          downloadLinks: 1,
          createdAt: 1,
          updatedAt: 1,
          
          // User data from the lookup
          "username": "$userData.username",
          "user_name": "$userData.user_name",
          "name": "$userData.name",
          "email": "$userData.email",
          "profilePicture": "$userData.profilePicture"
        }
      },
      
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message,
    });
  }
});

// Get single post API
app.get("/posts/:id", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const posts = await Post.aggregate([
      // Match the post by postId
      { $match: { postId: postId } },
      
      // Lookup to join with users collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      
      // Unwind the userData array to get a single object
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      
      // Project the fields we need
      {
        $project: {
          // Post fields
          postId: 1,
          title: 1,
          description: 1,
          picture: 1,
          genres: 1,
          category: 1,
          downloadLinks: 1,
          createdAt: 1,
          updatedAt: 1,
          
          // User data from the lookup
          "username": "$userData.username",
          "user_name": "$userData.user_name",
          "name": "$userData.name",
          "email": "$userData.email",
          "profilePicture": "$userData.profilePicture"
        }
      }
    ]);

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Since aggregate returns an array, get the first element
    const postWithUserData = posts[0];

    res.status(200).json(postWithUserData);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error: error.message,
    });
  }
});

// Update post API - UPDATED with JWT
app.put("/posts/:id", authenticateJWT, async (req, res) => {
  try {
    console.log("Update post request received:", {
      user: req.user,
      body: req.body,
      postId: req.params.id,
    });

    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // Get user from database
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      console.log("User not found for userId:", req.user.userId);
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
        userId: req.user.userId,
      });
    }

    // Find the post to update
    const existingPost = await Post.findOne({ postId: postId });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the authenticated user owns the post
    if (existingPost.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own posts",
      });
    }

    // Validate required fields
    const requiredFields = ["title", "description", "picture"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields: missingFields,
      });
    }

    // Prepare update data
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      picture: req.body.picture,
      downloadLinks: req.body.downloadLinks || existingPost.downloadLinks,
      genres: req.body.genres || existingPost.genres,
      category: req.body.category || existingPost.category,
      updatedAt: new Date(),
    };

    console.log("Updating post with data:", updateData);

    // Update the post
    const updatedPost = await Post.findOneAndUpdate(
      { postId: postId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log("Post updated successfully:", postId);

    // Use aggregation to get the updated post with user data
    const postsWithUserData = await Post.aggregate([
      { $match: { postId: postId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          postId: 1,
          title: 1,
          description: 1,
          picture: 1,
          genres: 1,
          category: 1,
          downloadLinks: 1,
          createdAt: 1,
          updatedAt: 1,
          "username": "$userData.username",
          "user_name": "$userData.user_name",
          "name": "$userData.name",
          "email": "$userData.email",
          "profilePicture": "$userData.profilePicture"
        }
      }
    ]);

    const finalPost = postsWithUserData[0];

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      postId: postId,
      post: finalPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error while updating post",
      error: error.message,
    });
  }
});

// PATCH endpoint for partial updates - UPDATED with JWT
app.patch("/posts/:id", authenticateJWT, async (req, res) => {
  try {
    console.log("Partial update post request received:", {
      user: req.user,
      body: req.body,
      postId: req.params.id,
    });

    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // Get user from database
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      console.log("User not found for userId:", req.user.userId);
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
        userId: req.user.userId,
      });
    }

    // Find the post to update
    const existingPost = await Post.findOne({ postId: postId });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the authenticated user owns the post
    if (existingPost.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own posts",
      });
    }

    // Prepare update data - only include fields that are provided
    const updateData = {
      updatedAt: new Date(),
    };

    // List of allowed fields to update
    const allowedFields = [
      "title", 
      "description", 
      "picture", 
      "downloadLinks", 
      "genres", 
      "category"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    console.log("Partially updating post with data:", updateData);

    // Update the post
    await Post.findOneAndUpdate(
      { postId: postId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Use aggregation to get the updated post with user data
    const postsWithUserData = await Post.aggregate([
      { $match: { postId: postId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          postId: 1,
          title: 1,
          description: 1,
          picture: 1,
          genres: 1,
          category: 1,
          downloadLinks: 1,
          createdAt: 1,
          updatedAt: 1,
          "username": "$userData.username",
          "user_name": "$userData.user_name",
          "name": "$userData.name",
          "email": "$userData.email",
          "profilePicture": "$userData.profilePicture"
        }
      }
    ]);

    const finalPost = postsWithUserData[0];

    console.log("Post partially updated successfully:", postId);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      postId: postId,
      post: finalPost,
    });
  } catch (error) {
    console.error("Error partially updating post:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error while updating post",
      error: error.message,
    });
  }
});

// Delete post API - UPDATED with JWT
app.delete("/posts/:id", authenticateJWT, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await Post.findOne({ postId: postId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Get current user
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user owns the post using userId reference
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await Post.deleteOne({ postId: postId });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
});

// Comments API Routes

// Create new comment - UPDATED with JWT
app.post("/comments", authenticateJWT, async (req, res) => {
  try {
    // Get user from database
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a custom comment ID
    const lastComment = await Comment.findOne().sort({ commentId: -1 });
    const newCommentId = lastComment ? lastComment.commentId + 1 : 1;

    // Insert new comment with only userId reference
    const newComment = new Comment({
      commentId: newCommentId,
      postId: req.body.postId,
      userId: user._id, // Only store userId reference
      comments: req.body.comments,
      date: new Date(),
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      commentId: newCommentId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    });
  }
});

// Get comments for a post with user data using aggregation
app.get("/comments/:postId", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const comments = await Comment.aggregate([
      { $match: { postId: postId } },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "userId", // Field in comments collection
          foreignField: "_id", // Field in users collection
          as: "userData" // Array containing user documents
        }
      },
      { $unwind: "$userData" }, // Convert array to object
      {
        $project: {
          commentId: 1,
          postId: 1,
          comments: 1,
          date: 1,
          // User data from users collection
          name: "$userData.name", // User's actual name
          username: "$userData.user_name", // User's username
          email: "$userData.email", // User's email
          profilePicture: "$userData.profilePicture" // User's profile picture
        }
      },
      { $sort: { date: -1 } } // Sort by date descending (newest first)
    ]);

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
});

// Delete comment - UPDATED with JWT
app.delete("/comments/:id", authenticateJWT, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Get current user
    const user = await User.findOne({ userId: req.user.userId });

    // Check if user owns the comment
    const isOwner = comment.userId.toString() === user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
});

// Edit comment - UPDATED with JWT
app.put("/comments/:id", authenticateJWT, async (req, res) => {
  try {
    const { updatedComment } = req.body;

    // Validate input
    if (!updatedComment || updatedComment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Get current user
    const user = await User.findOne({ userId: req.user.userId });

    // Check if user owns the comment
    const isOwner = comment.userId.toString() === user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    const result = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        comments: updatedComment,
        date: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    });
  }
});

// Get user's own posts - UPDATED with JWT
app.get("/my-posts", authenticateJWT, async (req, res) => {
  try {
    console.log("Get user posts request received:", {
      user: req.user,
      userId: req.user.userId,
    });

    // Get current user
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Use aggregation to get posts for the specific user with user data
    const posts = await Post.aggregate([
      // Match posts by the current user's ID
      { 
        $match: { 
          userId: user._id 
        } 
      },
      
      // Lookup to join with users collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      
      // Unwind the userData array to get a single object
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      
      // Project the fields we need
      {
        $project: {
          // Post fields
          postId: 1,
          title: 1,
          description: 1,
          picture: 1,
          genres: 1,
          category: 1,
          downloadLinks: 1,
          createdAt: 1,
          updatedAt: 1,
          
          // User data from the lookup
          "username": "$userData.username",
          "user_name": "$userData.user_name",
          "name": "$userData.name",
          "email": "$userData.email",
          "profilePicture": "$userData.profilePicture",
          
          // Include userId for reference
          "userId": 1
        }
      },
      
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } }
    ]);

    console.log(`Found ${posts.length} posts for user ${user.userId}`);

    res.status(200).json({
      success: true,
      posts: posts,
      count: posts.length
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your posts",
      error: error.message,
    });
  }
});

// JWT Token verification endpoint
app.get("/api/verify-token", authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: "Token is valid"
  });
});

// Check authentication status (for backward compatibility)
app.get("/api/check-auth", authenticateJWT, (req, res) => {
  console.log("Check-auth JWT user:", req.user);
  res.json({
    authenticated: true,
    username: req.user.username,
    name: req.user.name,
    userId: req.user.userId,
    email: req.user.email,
  });
});

// Enhanced logout endpoint
app.post("/api/logout", authenticateJWT, (req, res) => {
  // With JWT, logout is handled on the client side by removing the token
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Add endpoint to view all sessions (for debugging)
app.get("/api/debug-sessions", async (req, res) => {
  try {
    const sessions = await mongoose.connection.db
      .collection("sessions")
      .find({})
      .toArray();
    res.json({
      success: true,
      sessions: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving sessions",
      error: error.message,
    });
  }
});

// Protected route example
app.get("/api/protected", authenticateJWT, (req, res) => {
  res.json({
    message: `Hello ${req.user.username}, this is protected data!`,
    timestamp: new Date().toISOString(),
  });
});



// Serve static files from React build
const buildPath = path.join(__dirname, "../client/build");
console.log("Build path:", buildPath);

// Check if build directory exists
import fs from "fs";
if (fs.existsSync(buildPath)) {
  console.log("✅ Build directory found");
  app.use(express.static(buildPath));
  
  // Catch-all handler: must be the LAST route
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.log("❌ Build directory not found at:", buildPath);
  console.log("⏳ Running in API-only mode");
}



// Catch-all handler: must be the LAST route
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT authentication enabled with secret: ${JWT_SECRET}`);
  console.log(`Session store: MongoDB via connect-mongo`);
  console.log(`Serving React build from: ${buildPath}`); // Added log
});