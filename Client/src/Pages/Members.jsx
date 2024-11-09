import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import DefaultProfile from '../assets/defaultProfile.png';
import { UserContext } from '../../Context/UserContext';

const Members = () => {
    const { user } = useContext(UserContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            if (user && user.registerDetails && user.registerDetails._id) {
                try {
                    const { data } = await axios.get(`/members/${user.registerDetails._id}`);
                    setMembers(data.members || []);
                } catch (err) {
                    setError('Failed to load members');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchMembers();
    }, [user]);

    const getRandomColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    const handleFollowToggle = async (memberId, isFollowing) => {
        try {
            await axios.post(`/connections/${user.registerDetails._id}/${memberId}`, {
                follow: !isFollowing
            });

            setMembers(prevMembers =>
                prevMembers.map(member =>
                    member._id === memberId ? { ...member, isFollowing: !isFollowing } : member
                )
            );
        } catch (err) {
            console.error('Error updating follow status:', err);
        }
    };

    if (loading) return <p>Loading members...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="mt-6 border border-solid ml-16 mr-16 bg-white rounded-lg">
            <p className="font-bold text-xl mx-5 my-3 mb-7">Members</p>
            <div className="mx-5 flex mb-10">
                {members && members.length > 0 ? (
                    members.map(member => (
                        <div key={member._id} className="mb-4 border border-solid px-3 py-4 mx-5 mr-10 rounded-lg w-1/2 flex flex-col justify-center items-center">
                            <img src={user.photoDetails && user.photoDetails.profilePhoto ? `${import.meta.env.VITE_REACT_BACKEND_URL}/${user.photoDetails.profilePhoto}` : DefaultProfile} alt="" className='rounded-full mt-10 h-32 w-32' />
                            <p className='border border-solid text-xs text-white font-bold py-1 px-2 rounded-lg -mt-5' style={{ backgroundColor: getRandomColor() }}>{member.role}</p>
                            <p className="font-medium mt-4 mb-4">{member.username}</p>
                            <p className='mb-2'>{member.followersCount || 0} followers</p>
                            <button
                                className='border border-solid py-2 px-10 bg-slate-900 text-white font-semibold'
                                onClick={() => handleFollowToggle(member._id, member.isFollowing)}
                            >
                                {member.isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No members found.</p>
                )}
            </div>
        </div>
    );
};

export default Members;