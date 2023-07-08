import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Post from "./models/Post.js";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

const uri = process.env.URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        console.log("Username not found");
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log("You are logged in!");
          return done(null, user);
        } else {
          // passwords do not match!
          console.log("Incorrect password");
          return done(null, false, { message: "Incorrect password" });
        }
      });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Sign up
app.post("/sign-up", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    bcrypt.hash(password, salt, async (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        const user = new User({
          username: username,
          password: hashedPassword,
        });
        const result = await user
          .save()
          .then((result) => {
            console.log(result);
            res.status(201).send("User created successfully");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  } catch (err) {
    return next(err);
  }
});

// Login
app.post(
  "/login",
  passport.authenticate("local", {
    successMessage: "You are logged in",
    failureMessage: "Wrong Username or password",
  })
);

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401);
    console.log("You must be logged in to make a new post");
  }
};

// Create new blog post
app.post("/create-new-post", isLoggedIn, async (req, res, next) => {
  const { username, title, content } = req.body;
  try {
    const post = new Post({
      title: title,
      author: username,
      content: content,
      created: new Date(),
    });
    console.log(post);
    const result = await post
      .save()
      .then((result) => {
        res.status(201).send("Post was saved sucessfully");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    return next(err);
  }
});

// Retrieve blog posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Retrieve single blog post
app.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOne({ _id: postId });
    if (post) {
      res.status(200).send(post);
    } else {
      // Error handling for post not found
      res.status(404).send("Post not found");
    }
  } catch (err) {
    // Error handling for server connection error
    res.status(500).send("Server Error");
  }
});

// Update a blog post
app.put("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPostData = req.body;
    console.log(updatedPostData);
    const post = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $set: {
          title: updatedPostData.title,
          content: updatedPostData.content,
          updated: new Date().toLocaleDateString(),
        },
      },
      { new: true }
    );
    if (post) {
      res.status(200).send(post);
    } else {
      // Error handling for post not found
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Delete a blog post
app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await Post.deleteOne({ _id: postId });
    if (result.deletedCount === 1) {
      res.status(200).send("Post successfully deleted");
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.listen(3000, () => console.log(`App listening on port 3000!`));
