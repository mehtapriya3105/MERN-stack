import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner.tsx";
import { formatPostDate } from "../../utils/date/index.tsx";

interface PostProps {
  post: {
    _id: string;
    text: string;
    img?: string;
    comments: {
      _id: string;
      text: string;
      user: { profileImg: string | null; fullName: string; username: string };
    }[];
    likes: string[];
    createdAt: string; 
    user: {
      _id: string;
      username: string;
      fullName: string;
      profileImg: string | null;
    };
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const queryclient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const [comment, setComment] = useState<string>("");

  const postOwner = post.user;

  const isLiked = post.likes.includes(authUser.user._id);

  const isMyPost = post.user._id === authUser.user._id;

  const formattedDate = formatPostDate(post.createdAt);

 

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/delete/${post._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }
      console.log(data);
      return data;
    },
    onSuccess: () => {
      console.log("Post deleted successfully");
      toast.success("Post deleted successfully");
      //invalidate the post query
      queryclient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const handleDeletePost = () => {
    deletePost();
  };

  // const handlePostComment = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  // };

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error("Failed to like post");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      toast.success("Action Performed successfully");
      //This is not the best user experience - It refeches all post when even 1 is liked
      // queryclient.invalidateQueries({ queryKey: ["posts"] });

      // Instead we can update the cache directly - update the list for the specific post
      queryclient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p: { _id: string }) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });
  const handleLikePost = () => {
    if (isLiking) return; // overclicking is prevented
    likePost();
  };

  const { mutate: commentOnPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/comment/${post._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: comment }),
        });
        if (!res.ok) {
          throw new Error("Failed to comment on post");
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      toast.success("Comment Added successfully");
      setComment("");
      queryclient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handlePostComment = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (isCommenting) return; // overclicking is prevented
    commentOnPost();
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeleting && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}
                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  (
                    document.getElementById(
                      "comments_modal" + post._id
                    ) as HTMLDialogElement
                  )?.showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`} // creating unique id for each comment and each post
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
