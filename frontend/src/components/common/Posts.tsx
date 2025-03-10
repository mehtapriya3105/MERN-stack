import Post from "./Post.tsx";
import PostSkeleton from "../skeleton/PostSkeleton.tsx";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType , username,userId}: { feedType: string }) => {
  const getEndPoint = () => {
    console.log(feedType ,username, userId);
    switch (feedType) {
      case "forYou":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
        case "posts":
          return`/api/posts/user/${username}`;
        case "likes":
          return `/api/posts/user/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const POST_ENDPOINT = getEndPoint();
  console.log("Posts endpoint:", POST_ENDPOINT);
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await res.json();
        return data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch posts");
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);
  console.log("Posts fetched:", posts);
  console.log(typeof posts);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {(!isLoading || !isRefetching) && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {(!isLoading || !isRefetching) && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
