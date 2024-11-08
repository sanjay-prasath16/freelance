import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import defaultProf from "../assets/defaultProfile.png";
import { BiWorld, BiSolidLike, BiLike } from "react-icons/bi";
import { MdOutlineReportProblem } from "react-icons/md";

const Saved = () => {
  const { user } = useContext(UserContext);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const { data } = await axios.get(`/savedPosts/${user.registerDetails._id}`);
        setSavedPosts(data.savedPosts);
        if (data.message) {
          setError(data.message);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load saved posts");
        setLoading(false);
        console.error(err);
      }
  };

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          `/members/${user.registerDetails._id}`
        );
        setUsers(data.members);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    fetchSavedPosts();
    fetchUsers();
  }, [user.registerDetails._id]);

  const calculateDaysAgo = (createdAt) => {
    const postDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysPassed;
  };

  const handleFollowToggle = async (memberId, isFollowing) => {
    try {
      await axios.post(`/connections/${user.registerDetails._id}/${memberId}`, {
        follow: !isFollowing,
      });

      setUsers((prevMembers) =>
        prevMembers.map((member) =>
          member._id === memberId
            ? { ...member, isFollowing: !isFollowing }
            : member
        )
      );
    } catch (err) {
      console.error("Error updating follow status:", err);
    }
  };

  const handleLikeToggle = async (postId, isLiked) => {
    try {
      await axios.post(`/like/${postId}`, { userId: user.registerDetails._id });
      setSavedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, isLiked: !isLiked, likes: isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );
    } catch (err) {
      console.error("Error updating like status:", err);
    }
  };

  return (
    <div className="mt-6 flex flex-row">
      <div className="border border-solid bg-white rounded-2xl ml-6 lg:ml-20 mr-7 lg:mr-1 w-full md:w-9/12 mb-10">
        <p className="font-bold text-xl mx-5 my-3 mb-7">Saved Posts</p>
        {loading ? (
          <p>Loading saved posts...</p>
        ) : error ? (
          <p className="ml-5 mb-5">{error}</p>
        ) : savedPosts && savedPosts.length > 0 ? (
          savedPosts.map((post) => (
            <div
              key={post._id}
              className="mb-4 border border-solid px-3 py-4 mx-5 mr-10 rounded-lg"
            >
              <div className="flex w-full">
                <img
                  src={
                    post.profilePhoto
                      ? `http://localhost:3001/${post.profilePhoto}`
                      : defaultProf
                  }
                  alt=""
                  className="h-16 w-16 rounded-full border-2 border-gray-200"
                />
                <div className="ml-2 text-sm w-full">
                  <div className="flex">
                    <div>
                      <span className="font-bold">{post.username}</span>{" "}
                      posted this{" "}
                    </div>
                  </div>
                  <p>{post.role}</p>
                  <p className="flex">
                    {calculateDaysAgo(post.createdAt)} days ago{" "}
                    <BiWorld className="mt-1 ml-1 text-gray-500" />
                  </p>
                </div>
              </div>
              <div className="mt-5 ml-3">
                <p className="text-lg">{post.description}</p>
                {post.postPhoto && (
                  <img
                    src={`http://localhost:3001/${post.postPhoto}`}
                    alt="Post"
                    className="w-full h-auto rounded-xl mt-5 mb-2"
                  />
                )}
                <div className="flex mt-3">
                  <BiSolidLike className="mt-2 text-blue-800" />
                  <p className="mt-1 ml-1">{post.likes}</p>
                </div>
                <hr className="mb-3" />
                <div className="flex text-lg justify-between mx-20">
                  <p className="flex border border-white hover:bg-gray-200 rounded-lg px-2 cursor-pointer py-2">
                    <button onClick={() => handleLikeToggle(post._id, post.isLiked)} className="flex">
                      {post.isLiked ? <BiSolidLike className="text-blue-800 mt-1.5" /> : <BiLike className="mt-1.5" />}
                      <p className="ml-2">Like</p>
                    </button>
                  </p>
                  <p className="flex border border-white hover:bg-gray-200 rounded-lg px-2 cursor-pointer py-2">
                    <MdOutlineReportProblem className="mt-1 text-2xl" />
                    <span className="ml-2 mt-[2px]">Report</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-lg font-extrabold mb-5">No saved posts found.</p>
        )}
      </div>
      <div className="border border-solid md:block hidden bg-white rounded-2xl mx-6 lg:ml-10 lg:mr-28 w-3/12 p-4 h-full sticky top-28">
          <p className="font-bold text-xl mb-4">Suggested Users</p>
          {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className="mb-4 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <img
                    src={
                      user.profilePhoto
                        ? `http://localhost:3001/${user.profilePhoto}`
                        : defaultProf
                    }
                    alt={user.username}
                    className="h-12 w-12 rounded-full border-2 border-gray-200"
                  />
                  <div className="ml-3">
                    <p className="font-bold">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <button className="border text-white font-medium rounded-xl border-blue-500 bg-blue-500 px-3 py-1" onClick={() => handleFollowToggle(user._id, user.isFollowing)}>
                  {user.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
            ))
          ) : (
            <p>No users to suggest</p>
          )}
        </div>
      </div>
  );
};

export default Saved;