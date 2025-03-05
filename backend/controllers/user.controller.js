import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

//models
import User from "../models/user.models.js";
import notificationModel from "../models/notification.models.js";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getUserProfile function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModiy = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id == req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot follow unfollow yourself" });
    }
    if (!userToModiy || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!currentUser) {
      return res
        .status(401)
        .json({ error: "Not authorized to follow/unfollow this user" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // Send notification to the user
      const notification = new notificationModel({
        from: req.user._id,
        to: userToModiy._id,
        type: "follow",
      });
      await notification.save();

      //return the id of the user as a response
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error("Error in followUnfollowUser function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(req.user._id).select("-password");
    const userFollowedByMe = await User.findById(req.user._id).select(
      "following"
    );
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },

      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedUsers function: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserPorfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({ error: "Invalid password change request" });
    }

    if (currentPassword && newPassword) {
      const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    if (profileImg) {

        //Delete the old profile image if it exists
        if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg);
        }
        //Upload the new profile image
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
        //Delete the old cover image if it exists
        if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg);
        }
        //Upload the new cover image
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    console.log(email)
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.username = username || user.username;

    user = await user.save();//save the updated user to the database

    user.password = null; // Remove password from the response

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUserPorfile function: ", error);
    res.status(500).json({ error: error.message });
  }
};
