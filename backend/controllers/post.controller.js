import Post from "../models/post.model.js";
import User from "../models/user.models.js";
import { v2 as cloudinary } from "cloudinary";
import notificationModel from "../models/notification.models.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Text or image is required" });
    }

    if (img) {
      //no need to destroy becase it is the first time we are uploading an image
      img = await cloudinary.uploader.upload(img, { folder: "posts" });
      img = img.secure_url;
    }
    const newPost = new Post({
      text,
      img,
      user: userId,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // console.log(post.user);
    // console.log(req.user._id);

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0]; //extract the id from the img url
      await cloudinary.uploader.destroy(imgId); //delete the image from cloudinary
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to Comment" });
    }

    if (!text) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post id is required" });
    }
    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    const notification = new notificationModel({
      from: userId,
      to: post.user,
      type: "comment",
    });

    await notification.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in commentOnPost function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to like or unlike post" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const notification = new notificationModel({
        from: userId,
        to: post.user,
        type: "like",
      });
     
      await notification.save();

      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      //like the post
      await post.likes.push(userId);
      const x = await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new notificationModel({
        from: userId,
        to: post.user,
        type: "like",
      });
      
      await notification.save();

      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    console.error("Error in likeUnlikePost function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "You must be logged in to view posts" });
    }

    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "-password",
    }).
    populate({
        path: "comments.user",//populate the comment user details
        select: "-password -email",//remove the user's email and password
      });
    //this will sort the posts in descending order by createdAt - latest on top
    //populate gets the user details from the user model using the user id
    // {}  - object in js

    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const getLikedPosts = async (req, res) => {
   console.log(req.params);
  const {id} = req.params;
  
   const userId = id;
    try{
        const user = await User.findById(userId).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const likedPost = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password -email",
        }).sort({createdAt: -1});

        if(likedPost.length === 0){
            return res.status(200).json({message: "No liked posts found"});
        }

        res.status(200).json(likedPost);


    }
    catch(error){
        console.error("Error in getLikedPosts function: ", error);
        res.status(500).json({error: error.message});
    }
};

export const getFollowingPosts = async (req, res) => {
    try{
        console.log(req.user);
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const followingUsers = user.following;
        const followingPosts = await Post.find({ user: { $in: followingUsers } }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password -email",
        }).sort({ createdAt: -1});

        if(followingPosts.length === 0){
            return res.status(200).json({message: "No following posts found"});
        }

        res.status(200).json(followingPosts);
    }catch(error){
        console.error("Error in getFollowingPosts function: ", error);
        res.status(500).json({error: error.message});
    }
};

export const getUserPosts = async (req, res) => {
    try{
        const {username} = req.params;

        const user = await User.findOne({ username }).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const userPosts = await Post.find({ user: user._id }).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password -email",
        }).sort({ createdAt: -1});

        if(userPosts.length === 0){
            return res.status(200).json({message: "No posts found by this user"});
        }

        res.status(200).json(userPosts);
    }
    catch(error){
        console.error("Error in getUserPosts function: ", error);
        res.status(500).json({error: error.message});
    }
};