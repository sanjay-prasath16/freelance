import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import defaultBack from "../assets/backImage.webp";
import defaultProf from "../assets/defaultProfile.png";
import { FaCamera } from "react-icons/fa";
import { HiPhoto } from "react-icons/hi2";
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user } = useContext(UserContext);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(defaultProf);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(defaultBack);
  const [showModal, setShowModal] = useState(false);
  const [postImage, setPostImage] = useState(null);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempRole, setTempRole] = useState(role);

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
        console.log(user.id);
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
  
    fetchProfilePhoto();
  }, [user.id]);

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
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPostImage(null);
  };

  const triggerFileInput = (inputId) => {
    document.getElementById(inputId).click();
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        id: user.id,
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
                    className="h-40 z-0 mt-[-5rem] rounded-full border-4 border-white"
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
                  <span>1</span>
                  <span className="text-gray-400 font-medium"> followers</span>
                </p>
                <p className="ml-4">
                  <span>1</span>
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
                  <input
                    type="text"
                    value={tempRole}
                    onChange={(e) => setTempRole(e.target.value)}
                    placeholder="Role"
                    className="border p-2 rounded-lg outline-none"
                  />
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

          <div className="border border-solid bg-white rounded-lg h-40 mt-10 mb-5 pl-5 pt-5 w-full">
            <div className="flex">
              <div>
                <p className="text-xl font-extrabold">Activity</p>
                <p className="text-blue-800 font-semibold leading-none hover:border-b w-borderWidth mb-5 mt-1 hover:border-b-blue-800 cursor-pointer">
                  1 followers
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
            <p className="text-lg font-extrabold">{`You haven't posted yet`}</p>
            <p>{`Posts you share will be displayed here.`}</p>
          </div>
        </div>
        <div className="border border-solid md:block hidden bg-white rounded-2xl mx-6 lg:ml-10 lg:mr-28 w-3/12 h-12"></div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-postCreationWidth h-postCreationHeight flex flex-col relative w-3/6 h-4/5">
            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
            <textarea
              className="border-white outline-none w-full h-1/4 rounded-lg resize-none"
              placeholder="What do you want to talk about?"
            ></textarea>

            <div
              className="mt-4 overflow-auto flex-1"
              style={{ maxHeight: "200px" }}
            >
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
                onClick={closeModal}
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
    </div>
  );
};

export default Profile;