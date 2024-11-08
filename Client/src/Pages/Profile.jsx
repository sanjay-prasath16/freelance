import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import defaultBack from '../assets/backImage.webp';
import defaultProf from "../assets/defaultProfile.png";
import { FaCamera, FaChevronUp, FaChevronDown, FaBookmark } from "react-icons/fa";
import { HiPhoto } from "react-icons/hi2";
import { BiWorld, BiSolidLike, BiLike } from "react-icons/bi";
import { MdOutlineReportProblem, MdDeleteOutline } from "react-icons/md";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { CiBookmark } from "react-icons/ci";
import { FiEdit2 } from "react-icons/fi";
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user } = useContext(UserContext);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(defaultProf);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(defaultBack);
  const [showModal, setShowModal] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [postText, setPostText] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);

  const [name, setName] = useState(user.registerDetails.username);
  const [email, setEmail] = useState(user.registerDetails.email);
  const [role, setRole] = useState(user.registerDetails.role);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempRole, setTempRole] = useState(role);

  const [roleList] = useState(['Job Seeker', 'Job Provider']);
  const [roleOpen, setRoleOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [threeDotOpen, setThreeDotOpen] = useState(false);

  const [savedPosts, setSavedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDescription, setEditDescription] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [originalDescription, setOriginalDescription] = useState(user?.postDetails?.desc || "");
  const [tempDesc, setTempDesc] = useState(user?.postDetails?.desc || "");
  const [originalImage] = useState(user?.postDetails?.postPhoto || null);
  const [tempPostPhoto] = useState(user?.postDetails?.postPhoto || null);

  const careerToggleDown = () => {
    setRoleOpen((open) => !open);
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoUrl(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("profilePhoto", file);

      try {
        const { data:responseData } = await axios.post('/updateProfile', formData, {
          headers: {
            'Content-Type' : 'multipart/form-data'
          }
        });
        if(responseData.err) {
          toast.error(responseData.err);
        } else {
          toast.success(responseData.message);
        }
      } catch(err) {
        console.error("File upload failed:", err);
      }
    }
  };

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const { data } = await axios.get('/verifyPhoto');
        if (data.profilePhotoExists && data.profilePhotoUrl) {
          setProfilePhotoUrl(data.profilePhotoUrl);
        }

        if(data.coverPhotoExists && data.coverPhotoUrl) {
            setCoverPhotoUrl(data.coverPhotoUrl);
        }
      } catch (err) {
        console.error("Error fetching profile photo:", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await axios.get(`/posts/${user.registerDetails._id}`);
        setPosts(data.posts);
        setLoadingPosts(false);
      } catch(err) {
        setPostsError('Failed to load posts');
        console.log(err);
        setLoadingPosts(false);
      }
    };

    const verifySaved = async () => {
      try {
        const { data } = await axios.get('/checkSaved');
        setSavedPosts(data.savedPosts)
      } catch(err) {
        console.log(err);
      }
    };

    const fetchPostData = async () => {
      try {
        const response = await axios.get(`/checkPostPhoto/${activePostId}`);
        const postData = response.data;
  
        setEditImage(`${import.meta.env.VITE_REACT_BACKEND_URL}/${postData.postPhoto ? postData.postPhoto : null}`);
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };
  
    if (activePostId) {
      fetchPostData();
    }
  
    fetchProfilePhoto();
    fetchPosts();
    verifySaved();
  }, [user, user.registerDetails._id, user?.postDetails?.createdAt, activePostId]);

  const calculateDaysAgo = (createdAt) => {
    const postDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysPassed;
  };

  const handleBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setCoverPhotoUrl(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("coverPhoto", file);
  
        try {
            const { data:responseData } = await axios.post('/updateProfile', formData, {
                headers: {
                'Content-Type' : 'multipart/form-data'
                }
            });
            if(responseData.err) {
                toast.error(responseData.err);
            } else {
                toast.success(responseData.message);
            }
        } catch(err) {
            console.error("File upload failed:", err);
        }
    }
  };

  const handleCreatePostClick = () => {
    setShowModal(true);
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(URL.createObjectURL(file));
      setPostImageFile(file);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPostImage(null);
    setPostText("");
    setPostImageFile(null);
  };

  const triggerFileInput = (inputId) => {
    document.getElementById(inputId).click();
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        id: user.registerDetails._id,
        username: tempName,
        email: tempEmail,
        role: tempRole,
      };

      const { data: responseData } = await axios.post('/updateUserDetails', updatedData);

      if (responseData.err) {
        toast.error(responseData.err);
      } else {
        setName(tempName);
        setEmail(tempEmail);
        setRole(tempRole);
        setIsEditModalOpen(false);
        toast.success("Details updated successfully.");
      }
    } catch (err) {
      console.error("Failed to save changes:", err);
      toast.error("Failed to update details. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setTempName(name);
    setTempEmail(email);
    setTempRole(role);
  };

  const handlePostSubmit = async () => {
    if (!postText) {
      toast.error("Post description is required.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.registerDetails._id);
    formData.append("desc", postText);

    if (postImageFile) {
      formData.append("postPhoto", postImageFile);
    }

    try {
      const { data: responseData } = await axios.post('/postDetails', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (responseData.err) {
        toast.error(responseData.err);
      } else {
        toast.success("Post created successfully.");
        closeModal();
        const { data } = await axios.get(`/posts/${user.registerDetails._id}`)
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const openDotDropdown = (postId) => {
    setActivePostId(postId);
    setThreeDotOpen(!threeDotOpen);
  };

  const isPostSaved = (postId) => {
    return savedPosts.some(savedPost => savedPost.postId === postId && savedPost.saved);
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
      setSavedPosts(prev =>
        prev.map(savedPost =>
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
      const response = await axios.post('/unsaved', data);
      if(response.data.message) {
        toast.success(response.data.message);
      } else if(response.data.err) {
        toast.err(response.data.err);
      }
    } catch(err) {
      console.log(err);
      toast.error("Cant unsave post please try again");
    } finally {
      setThreeDotOpen(!threeDotOpen);
    }
  }

  const handleEditClick = (postId, currentDesc) => {
    setActivePostId(postId);
    setEditDescription((prev) => ({
      ...prev,
      [postId]: currentDesc,
    }));
    setIsEditOpen(true);
    setThreeDotOpen(!threeDotOpen);
  };  

  const handleCancel = () => {
    setEditDescription(originalDescription);
    setTempDesc(originalDescription);
    setEditImage(originalImage);
    setIsEditOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };  

  const handleEditChanges = async (activePostId, userId) => {
    try {
      const editedDetails = {
        userId: userId,
        postId: activePostId,
        description: tempDesc,
        postPhoto: tempPostPhoto
      };

      const { data: responseData } = await axios.post('/savePostEdit', editedDetails);

      if(responseData.err) {
        toast.error(responseData.err);
      } else {
        setOriginalDescription(tempDesc);
        setPostImage(tempPostPhoto);
        setIsEditOpen(false);
        toast.success('The post have been updated successfully!!');
      }
    } catch(err) {
      console.log("Failed to edit post:", err);
      toast.error("Failed to update post details. Please try again later");
    }
  };

  return (
    <div>
      <div className="mt-6 flex flex-row">
        <div className="w-full relative ml-6 lg:ml-20 mr-7 lg:mr-1 md:w-9/12">
          <div className="border border-solid bg-white rounded-2xl">
            <div className="relative">
              <div className="absolute top-4 left-4 p-2 border border-white rounded-lg bg-white cursor-pointer group">
                <label htmlFor="backgroundInput" className="cursor-pointer">
                  <FaCamera className="text-2xl" />
                </label>
                <input
                  id="backgroundInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBackgroundChange}
                />
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 w-32 text-center">
                  Change cover photo
                </span>
              </div>
            </div>
            <img
              src={coverPhotoUrl}
              alt="Background"
              className="w-full h-60 object-cover rounded-lg z-0"
            />
            <div className="flex items-center w-full flex-col">
              <div className="relative group cursor-pointer">
                <label htmlFor="profileInput" className="cursor-pointer">
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="h-40 w-40 z-0 mt-[-5rem] rounded-full border-4 border-white"
                  />
                </label>
                <input
                  id="profileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileChange}
                />
                <span
                  className="absolute top-1/2 left-1/2 w-32 transform -translate-x-1/2 translate-y-[120%] bg-black text-white text-xs py-2 px-2 rounded-lg opacity-0 group-hover:opacity-100"
                  style={{ zIndex: "100" }}
                >
                  Change profile photo
                </span>
              </div>

              <p className="border border-solid mt-[-1rem] px-4 py-1 rounded-lg bg-purple-800 font-semibold text-white text-sm z-10">
                {role}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="text-3xl font-bold text-gray-700 mt-5">{name}</h1>
              <div className="flex mb-10">
                <p>
                  {user.connectionDetails != null ? user.connectionDetails.followersCount : 0}
                  <span className="text-gray-400 font-medium"> followers</span>
                </p>
                <p className="ml-4">
                  {user.connectionDetails != null ? user.connectionDetails.followingsCount : 0}
                  <span className="text-gray-400 font-medium"> followings</span>
                </p>
              </div>
            </div>
          </div>
          <div className="border border-solid bg-white rounded-lg mt-10 p-6 pr-7 mb-10">
            <div className="flex justify-between">
              <p className="text-lg font-bold">Personal Details</p>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="border border-white bg-gray-100 hover:bg-purple-800 hover:text-white py-2 px-5 -mt-2 rounded-xl font-semibold"
              >
                Edit
              </button>
            </div>
            <hr className="mt-5" />
            <div>
              <div className="flex py-2">
                <p className="text-lg text-gray-500 mr-40">Name</p>
                <p className="text-lg">{name}</p>
              </div>
              <div className="flex py-2">
                <p className="text-lg text-gray-500 mr-40">Email</p>
                <p className="text-lg">{email}</p>
              </div>
              <div className="flex py-2">
                <p className="text-lg text-gray-500 mr-[10.7rem]">Role</p>
                <p className="text-lg">{role}</p>
              </div>
            </div>
          </div>

          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-1/3 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Edit Personal Details</h2>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Name"
                    className="border p-2 rounded-lg outline-none"
                  />
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="Email"
                    className="border p-2 rounded-lg outline-none"
                  />
                  <div className="mb-4 relative">
                    <div className="border border-solid flex justify-between items-center rounded-lg py-2 px-2 cursor-pointer" onClick={careerToggleDown}>
                      <p className="text-gray-500">{tempRole ? tempRole : "Select a role"}</p>
                      {roleOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                    {roleOpen && (
                      <ul className="bg-white mt-2 py-2 rounded-lg z-10 absolute w-full border border-solid">
                        {roleList.map((roleOption) => (
                          <li
                            key={roleOption}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setTempRole(roleOption);
                              setRoleOpen(false);
                            }}
                          >
                            {roleOption}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="mr-4 border bg-gray-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="border bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border border-solid bg-white rounded-lg mt-10 mb-5 pl-5 pt-5 w-full">
            <div className="flex">
              <div>
                <p className="text-xl font-extrabold">Activity</p>
                <p className="text-blue-800 font-semibold leading-none hover:border-b w-borderWidth mb-10 mt-1 hover:border-b-blue-800 cursor-pointer">
                  {user.connectionDetails != null ? user.connectionDetails.followersCount : 0} followers
                </p>
              </div>
              <div className="ml-auto mr-10">
                <button
                  onClick={handleCreatePostClick}
                  className="border h-10 text-blue-600 pl-3 pr-3 rounded-lg text-lg font-semibold border-blue-600 hover:border-2 hover:bg-blue-50"
                >
                  Create a post
                </button>
              </div>
            </div>
            {loadingPosts ? (
              <p>Loading posts...</p>
            ) : postsError ? (
              <p>{postsError}</p>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="mb-4 border border-solid px-3 py-4 mx-5 mr-10 rounded-lg">
                  <div className="flex w-full">
                    <img src={profilePhotoUrl} alt="" className="h-16 w-16 rounded-full border-2 border-gray-200" />
                    <div className="ml-2 text-sm w-full">
                      <div className="flex">
                        <div><span className="font-bold">{user.registerDetails.username}</span> posted this </div>
                        <div className="ml-auto relative">
                          <div className="hover:rounded-full hover:bg-gray-200 p-1 inline-block">
                            <PiDotsThreeOutlineVerticalFill className="cursor-pointer" onClick={() => openDotDropdown(post._id)} />
                          </div>
                          {activePostId === post._id && threeDotOpen && (
                            <div className="border border-gray-300 mt-2 absolute right-0 bg-white text-lg w-40 shadow-lg p-2 rounded-lg">
                              {isPostSaved(post._id) ? (
                                <p className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md" onClick={() => handleUnsaveClick(post._id)}>
                                  <FaBookmark className="mt-[0.4rem] mr-3" /> Unsave
                                </p>
                              ) : (
                                <p className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md" onClick={() => handleSaveClick(post._id)}>
                                  <CiBookmark className="mt-[0.4rem] mr-3" /> Save
                                </p>
                              )}
                              <p className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md" onClick={() => handleEditClick(post._id, post.desc)}><FiEdit2 className="mt-[0.4rem] mr-3" /> Edit Post</p>
                              <p className="flex p-2 cursor-pointer hover:bg-gray-200 hover:rounded-md"><MdDeleteOutline className="mt-[0.4rem] mr-3" onClick={() => setThreeDotOpen(!threeDotOpen)} /> Delete Post</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p>{user.registerDetails.role} | skill</p>
                      <p className="flex">{calculateDaysAgo(post.createdAt)} days ago <BiWorld className="mt-1 ml-1 text-gray-500" /></p>
                    </div>
                  </div>
                  <div className="mt-5 ml-3">
                    <p className="text-lg">{post.desc}</p>
                    {post.postPhoto && (
                      <img
                        src={`${import.meta.env.VITE_REACT_BACKEND_URL}/${post.postPhoto}`}
                        alt="Post"
                        className="w-full h-auto rounded-xl mt-5 mb-2"
                      />
                    )}
                    <div className="flex mt-3 b"><BiSolidLike className="mt-2 text-blue-800" /><p className="mt-1 ml-1">0</p></div>
                    <hr className="mb-3" />
                    <div className="flex text-lg justify-between mx-20">
                      <p className="flex border border-white hover:bg-gray-200 rounded-lg px-2 cursor-pointer py-2"><BiLike className="mt-1 text-2xl" /><span className="ml-2 mt-[2px]">Like</span></p>
                      <p className="flex border border-white hover:bg-gray-200 rounded-lg px-2 cursor-pointer py-2"><MdOutlineReportProblem className="mt-1 text-2xl" /><span className="ml-2 mt-[2px]">Report</span></p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-lg font-extrabold mb-5">{`You haven't posted yet`}</p>
            )}
          </div>
        </div>
        <div className="border border-solid md:block hidden bg-white rounded-2xl mx-6 lg:ml-10 lg:mr-28 w-3/12 h-12"></div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-postCreationWidth h-postCreationHeight flex flex-col relative w-3/6 h-4/5 mt-20">
            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
            <textarea
              className="border-white outline-none w-full h-1/4 rounded-lg resize-none"
              placeholder="What do you want to talk about?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            ></textarea>

            <div className="mt-4 overflow-auto flex-1" style={{ maxHeight: "200px" }}>
              {postImage && (
                <img
                  src={postImage}
                  alt="Uploaded Post"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>

            <div className="flex items-center mt-6">
              <HiPhoto
                className="text-2xl cursor-pointer"
                onClick={() => triggerFileInput("postFileInput")}
              />
            </div>

            <hr className="my-4" />

            <div className="flex justify-end items-end mt-4">
              <button
                onClick={closeModal}
                className="border h-10 text-blue-600 pl-3 pr-3 rounded-lg text-lg font-semibold border-blue-600 hover:border-2 hover:bg-blue-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostSubmit}
                className="ml-4 bg-blue-600 text-white h-10 pl-3 pr-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
          <input 
            id="postFileInput" 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handlePostImageChange}
          />
        </div>
      )}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-4">Edit Post</h2>
            
            <textarea
              className="w-full h-24 p-2 border border-gray-300 rounded-md mb-4"
              value={editDescription}
              onChange={(e) => setTempDesc(e.target.value)}
              placeholder="Edit your description here"
            />

            {editImage && (
              <div className="mb-4">
                <img src={`${editImage}`} alt="Post" className="mb-2 max-h-48 object-cover" />
                <input type="file" accept="image/*" id="fileInput" onChange={handleImageChange} style={{ display: 'none' }} />
                <label htmlFor="fileInput" className="inline-block px-5 py-2 bg-white cursor-pointer rounded-lg border border-black">Edit post photo</label>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg mr-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
              
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                onClick={() => handleEditChanges(activePostId, user.registerDetails._id)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;