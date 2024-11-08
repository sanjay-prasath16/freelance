import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { CiBookmark } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa";
import { BiWorld, BiSolidLike, BiLike } from "react-icons/bi";
import { MdOutlineReportProblem } from "react-icons/md";
import defaultProf from "../assets/defaultProfile.png";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [threeDotOpen, setThreeDotOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get("/posts");
        const otherUsersPosts = data.posts.filter(
          (post) => post.userId._id !== user.registerDetails._id
        );
        setPosts(otherUsersPosts);
        setLoadingPosts(false);
      } catch (err) {
        setPostsError("Failed to load posts");
        console.error(err);
        setLoadingPosts(false);
      }
    };

    const verifySaved = async () => {
      try {
        const { data } = await axios.get("/checkSaved");
        setSavedPosts(data.savedPosts);
      } catch (err) {
        console.log(err);
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

    fetchPosts();
    verifySaved();
    fetchUsers();
  }, [user.registerDetails._id]);

  const openDotDropdown = (postId) => {
    setActivePostId(postId);
    setThreeDotOpen(!threeDotOpen);
  };

  const isPostSaved = (postId) => {
    return savedPosts.some(
      (savedPost) => savedPost.postId === postId && savedPost.saved
    );
  };

  const handleSaveClick = async (postId) => {
    try {
      const data = {
        regId: user.registerDetails._id,
        postId,
      };
      const response = await axios.post(`/save`, data);
      if (response.data.saved) {
        toast.success("Post saved successfully.");
      } else {
        toast.success("Post unsaved successfully.");
      }
      setSavedPosts((prev) =>
        prev.map((savedPost) =>
          savedPost.postId === postId
            ? { ...savedPost, saved: !savedPost.saved }
            : savedPost
        )
      );
    } catch (err) {
      console.error("Error saving post:", err);
      toast.error("Failed to save post.");
    } finally {
      setThreeDotOpen(!threeDotOpen);
    }
  };

  const handleUnsaveClick = async (postId) => {
    try {
      const data = {
        regId: user.registerDetails._id,
        postId,
      };
      const response = await axios.post("/unsaved", data);
      if (response.data.message) {
        toast.success(response.data.message);
      } else if (response.data.err) {
        toast.err(response.data.err);
      }
    } catch (err) {
      console.log(err);
      toast.error("Cant unsave post please try again");
    } finally {
      setThreeDotOpen(!threeDotOpen);
    }
  };

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

  return (
    <div>
      <div className="mt-6 flex flex-row">
        <div className="border border-solid bg-white rounded-2xl ml-6 lg:ml-20 mr-7 lg:mr-1 w-full md:w-9/12 mb-10">
          <p className="font-bold text-xl mx-5 my-3 mb-7">Activity Feed</p>
          {loadingPosts ? (
            <p>Loading posts...</p>
          ) : postsError ? (
            <p>{postsError}</p>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
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
                        <span className="font-bold">
                          {post.userId.username}
                        </span>{" "}
                        posted this{" "}
                      </div>
                      <div className="ml-auto relative">
                        <div className="hover:rounded-full hover:bg-gray-200 p-1 inline-block">
                          <PiDotsThreeOutlineVerticalFill
                            className="cursor-pointer"
                            onClick={() => openDotDropdown(post._id)}
                          />
                        </div>
                        {activePostId === post._id && threeDotOpen && (
                          <div className="border border-gray-300 mt-2 absolute right-0 bg-white text-lg w-40 shadow-lg p-2 rounded-lg">
                            {isPostSaved(post._id) ? (
                              <p
                                className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md"
                                onClick={() => handleUnsaveClick(post._id)}
                              >
                                <FaBookmark className="mt-[0.4rem] mr-3" />{" "}
                                Unsave
                              </p>
                            ) : (
                              <p
                                className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md"
                                onClick={() => handleSaveClick(post._id)}
                              >
                                <CiBookmark className="mt-[0.4rem] mr-3" /> Save
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p>{post.userId.role} | skill</p>
                    <p className="flex">
                      {calculateDaysAgo(post.createdAt)} days ago{" "}
                      <BiWorld className="mt-1 ml-1 text-gray-500" />
                    </p>
                  </div>
                </div>
                <div className="mt-5 ml-3">
                  <p className="text-lg">{post.desc}</p>
                  {post.postPhoto && (
                    <img
                      src={`${import.meta.env.VITE_REACT_BACKEND_URL}/${
                        post.postPhoto
                      }`}
                      alt="Post"
                      className="w-full h-auto rounded-xl mt-5 mb-2"
                    />
                  )}
                  <div className="flex mt-3 b">
                    <BiSolidLike className="mt-2 text-blue-800" />
                    <p className="mt-1 ml-1">0</p>
                  </div>
                  <hr className="mb-3" />
                  <div className="flex text-lg justify-between mx-20">
                    <p className="flex border border-white hover:bg-gray-200 rounded-lg px-2 cursor-pointer py-2">
                      <BiLike className="mt-1 text-2xl" />
                      <span className="ml-2 mt-[2px]">Like</span>
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
            <p className="text-lg font-medium mb-5 ml-5">{`No Post to View`}</p>
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
    </div>
  );
};

export default Home;