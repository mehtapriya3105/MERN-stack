import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryclient = useQueryClient();

  const { mutate: followUnfollow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Failed to follow user");
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }
        console.log(data);
        return data;
      } catch (error) {
        console.error(error);
        toast.error("Failed to follow/unfollow user");
      }
    },
    onSuccess : () => {
        toast.success("Action Performed successfully");
        Promise.all([
        queryclient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
        queryclient.invalidateQueries({ queryKey: ["authUsers"] })
        ]);
    },
    onError: (error) => {   
        toast.error(error.message);
    },
   
  });

  return { followUnfollow, isPending };
};

export default useFollow;
