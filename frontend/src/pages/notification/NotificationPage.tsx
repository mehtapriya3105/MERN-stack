import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";

import { FaComment, FaUser } from "react-icons/fa";
import { FaDeleteLeft, FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";

const NotificationPage = () => {
 
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    },
  });

  const queryclient = useQueryClient();

  const { mutate: deletedNotification, isPending: isDeletingNotification } =
    useMutation({
      mutationFn: async () => {
        try {
          const res = await fetch(`/api/notifications/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) {
            throw new Error("Failed to delete notification");
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
      onError: (error: any) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success("All notifications deleted");
        queryclient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });
  // const isLoading = false;
  // const notifications = [
  // 	{
  // 		_id: "1",
  // 		from: {
  // 			_id: "1",
  // 			username: "johndoe",
  // 			profileImg: "/avatars/boy2.png",
  // 		},
  // 		type: "follow",
  // 	},
  // 	{
  // 		_id: "2",
  // 		from: {
  // 			_id: "2",
  // 			username: "janedoe",
  // 			profileImg: "/avatars/girl1.png",
  // 		},
  // 		type: "like",
  // 	},
  // ];

  const deleteNotifications = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (isDeletingNotification) return; // overclicking is prevented
    deletedNotification();
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <FaDeleteLeft className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map(
          (notification: {
            _id: Key | null | undefined;
            type: string;
            from: {
              username:
                | string
                | number
                | bigint
                | boolean
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactPortal
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined;
              profileImg: any;
            };
          }) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-blue-500" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                {notification.type === "comment" && (
                  <FaComment className="w-7 h-7 text-blue-500" />
                )}
                {notification.type === "unlike" && (
                  <FaHeart className="w-7 h-7 " />
                )}
                <Link to={`/profile/${notification.from.username}`}>
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="font-bold">
                      @{notification.from.username}
                    </span>{" "}
                    {notification.type === "follow"
                      ? "followed you"
                      : "liked your post"}
                  </div>
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};
export default NotificationPage;
