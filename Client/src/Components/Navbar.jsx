import { useState,useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Logo from '../assets/logo.png';
import DefaultProfile from '../assets/defaultProfile.png';
import { RiHomeLine } from "react-icons/ri";
import { BsPersonAdd } from "react-icons/bs";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { GrAppsRounded } from "react-icons/gr";

const Navbar = () => {
  const { user } = useContext(UserContext);

  console.log(user);

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    const { data: responseData } = await axios.get('/logout', {});
    toast.success(responseData.message);
    navigate('/');
  }

  const toggleNavMenu = () => {
    setIsOpen(!isOpen);
  }

  const closeNavMenu = () => {
    setIsOpen(false);
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }

  return (
    <div className="h-20 border border-solid bg-white flex justify-between items-center relative lg:sticky top-0 z-[1000]">
      <div className='flex items-center'>
        <img src={Logo} alt="Logo" className='ml-2 md:ml-16 h-10 lg:h-14' />
        <div className='border-r border-gray-300 h-8 ml-1 md:ml-3'></div>
        <p className='ml-1 md:ml-3 lg:text-xl font-semibold'>FlexWorkr</p>
      </div>
      <div className="sm:hidden mr-4 flex items-center">
        <div className="navToggle cursor-pointer" onClick={toggleNavMenu}>
          {isOpen ? <FaTimes className="text-2xl" /> : <GrAppsRounded className="text-2xl" />}
        </div>
      </div>
      <div className="hidden sm:flex mt-4">
        <Link to='/home' className='group mr-2 py-4 px-5 relative'>
          <div className={`hover:bg-gray-100 rounded-lg p-4`}>
            <RiHomeLine className='text-2xl cursor-pointer' />
          </div>
          <div className={`${location.pathname === '/home' ? 'border-b-2 border-black' : ''}`}></div>
          <span className="absolute bottom-[-15px] left-5 bg-black text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Home
          </span>
        </Link>
        <Link to='/members' className='group mr-2 py-4 px-5 relative'>
          <div className={`hover:bg-gray-100 rounded-lg p-4`}>
            <BsPersonAdd className='text-2xl cursor-pointer' />
          </div>
          <div className={`${location.pathname === '/members' ? 'border-b-2 border-black' : ''}`}></div>
          <span className="absolute bottom-[-15px] left-3 bg-black text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Members
          </span>
        </Link>
        <Link to='/saved' className='group mr-2 py-4 px-5 relative'>
          <div className={`hover:bg-gray-100 rounded-lg p-4`}>
            <FaRegBookmark className='text-2xl cursor-pointer' />
          </div>
          <div className={`${location.pathname === '/saved' ? 'border-b-2 border-black' : ''}`}></div>
          <span className="absolute bottom-[-15px] left-4 bg-black text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Saved
          </span>
        </Link>
        <Link to='/profile' className='group mr-2 py-4 px-5 relative'>
          <div className={`hover:bg-gray-100 rounded-lg p-4`}>
            <IoPersonCircleOutline className='text-2xl cursor-pointer' />
          </div>
          <div className={`${location.pathname === '/profile' ? 'border-b-2 border-black' : ''}`}></div>
          <span className="absolute bottom-[-15px] left-5 bg-black text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Profile
          </span>
        </Link>
      </div>
      <div className={`absolute top-20 left-0 right-0 bg-white sm:hidden z-50 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
        <div className='flex flex-col'>
          <Link to='/home' className='py-4 px-5 border-t border-gray-200 flex' onClick={closeNavMenu}>
            <RiHomeLine className='text-2xl cursor-pointer' />
            <span className="ml-2">Home</span>
          </Link>
          <Link to='/members' className='py-4 px-5 border-t border-gray-200 flex' onClick={closeNavMenu}>
            <BsPersonAdd className='text-2xl cursor-pointer' />
            <span className="ml-2">Members</span>
          </Link>
          <Link to='/settings' className='py-4 px-5 border-t border-gray-200 flex' onClick={closeNavMenu}>
            <FaRegBookmark className='text-2xl cursor-pointer font-extrabold' />
            <span className="ml-2">Saved</span>
          </Link>
          <Link to='/profile' className='py-4 px-5 border-t border-gray-200 flex' onClick={closeNavMenu}>
            <IoPersonCircleOutline className='text-2xl cursor-pointer' />
            <span className="ml-2">Profile</span>
          </Link>
          <div className="border-t border-gray-200 py-4 px-5 flex" onClick={toggleDropdown}>
            <IoPersonCircleOutline className='text-2xl cursor-pointer' />
            <span className="ml-2">{user.registerDetails.username}</span>
          </div>
          {isDropdownOpen && (
            <div className="flex flex-col bg-white border-t border-gray-200">
              <Link to='/members' className='block px-5 hover:bg-gray-100'>Followers</Link>
              <Link to='/members' className='block px-5 hover:bg-gray-100'>Followings</Link>
              <Link to='/profile' className='block px-5 hover:bg-gray-100'>Posts</Link>
              <button onClick={logout} className='block text-left w-full px-5 hover:bg-gray-100'>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className='mr-8 hidden sm:flex border border-white hover:bg-gray-100 rounded-lg px-2 cursor-pointer py-2 relative' onClick={toggleDropdown}>
        <p className='mt-2 font-semibold'>{user.registerDetails.username}</p>
        <img 
          src={user.photoDetails && user.photoDetails.profilePhoto ? `${import.meta.env.VITE_REACT_BACKEND_URL}/${user.photoDetails.profilePhoto}` : DefaultProfile}
          alt="Profile" 
          className='ml-2 rounded-full h-10 w-10'
        />
        {isDropdownOpen && (
          <div className="absolute top-16 right-0 bg-white border border-gray-300 rounded-lg w-40 shadow-lg z-50 text-center p-1">
            <Link to='/members' className='block py-2 hover:bg-gray-100 rounded-lg pb-2'>Followers</Link>
            <Link to='/members' className='block py-2 hover:bg-gray-100 rounded-lg pb-2'>Followings</Link>
            <Link to='/saved' className='block py-2 hover:bg-gray-100 rounded-lg pb-2'>Saved Posts</Link>
            <button onClick={logout} className='block w-full py-2 hover:bg-gray-100 rounded-lg pb-2'>Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar;