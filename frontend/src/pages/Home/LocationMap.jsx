import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../constants/apiPaths';
import DashboardLayout from '../../components/DashboardLayout';
import MapContainer from '../../components/MapContainer';
import toast from 'react-hot-toast';
import { MapPin, Search, Target, Users } from 'lucide-react';
import { BeatLoader } from 'react-spinners';

const LocationMap = () => {
    const { user, updateUser } = useContext(UserContext);
    const [address, setAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingMap, setIsLoadingMap] = useState(true);
    const [markers, setMarkers] = useState([]);
    const [center, setCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Default US center

    useEffect(() => {
        // Init form with user's current address if they have one
        if (user?.location?.address) {
            setAddress(user.location.address);
            if (user.location.lat && user.location.lng) {
                setCenter({ lat: user.location.lat, lng: user.location.lng });
            }
        }
        
        fetchMapLocations();
    }, [user]);

    const fetchMapLocations = async () => {
        setIsLoadingMap(true);
        try {
            const response = await axiosInstance.get(API_PATHS.AUTH.GET_MAP_LOCATIONS);
            const { markers: API_markers, currentUserLocation } = response.data;
            
            // Set targets
            setMarkers(API_markers);
            
            // Re-center map explicitly to user's location if the backend confirms it
            if(currentUserLocation && currentUserLocation.lat) {
                 setCenter({ lat: currentUserLocation.lat, lng: currentUserLocation.lng });
            }
            
        } catch (error) {
            console.error("Failed to fetch map locations", error);
            toast.error("Could not load map data");
        } finally {
            setIsLoadingMap(false);
        }
    };

    const handleUpdateLocation = async (e) => {
        e.preventDefault();
        if (!address.trim()) {
            toast.error("Please enter an address");
            return;
        }

        setIsSaving(true);
        try {
            const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_LOCATION, { address });
            toast.success("Location updated successfully!");
            
            // Update auth context so other files know user has location
            updateUser({
                ...user,
                location: response.data.location
            });
            
            setCenter({ lat: response.data.location.lat, lng: response.data.location.lng });
            
            // Refetch markers as new location might trigger new regional data later
            fetchMapLocations();
        } catch (error) {
            console.error("Location update failed", error);
            toast.error(error.response?.data?.message || "Failed to update location. Please try a valid address.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Location Map</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {user?.role === 'candidate' 
                                ? "Find Interviewers near your location." 
                                : "Discover Candidates near your location."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-180px)] min-h-[600px]">
                
                {/* Left Panel: Settings & List */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
                    
                    {/* Setup Card */}
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Target size={100} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 relative z-10 flex items-center gap-2">
                            <Target size={18} className="text-blue-500" /> My Location
                        </h2>
                        
                        <form onSubmit={handleUpdateLocation} className="relative z-10">
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Your Address / City
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. San Francisco, CA"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={isSaving || !address.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <BeatLoader size={8} color="white" /> : 'Set Location'}
                            </button>
                        </form>
                    </div>

                    {/* Stats Card */}
                    <div className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col">
                         <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Users size={18} className="text-green-500" /> 
                            Nearby {user?.role === 'candidate' ? 'Interviewers' : 'Candidates'}
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {isLoadingMap ? (
                                <div className="flex justify-center py-10">
                                   <BeatLoader size={8} color="#3b82f6" />
                                </div>
                            ) : markers.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-10 bg-gray-50 dark:bg-[#252525] rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                    No {user?.role === 'candidate' ? 'interviewers' : 'candidates'} found with public locations yet.
                                </div>
                            ) : (
                                markers.map(m => (
                                    <div key={m._id} className="p-3 bg-gray-50 dark:bg-[rgba(255,255,255,0.02)] rounded-xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                                            {m.name ? m.name.charAt(0) : 'U'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{m.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{m.location?.address || 'Unknown'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Panel: Map */}
                <div className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm relative min-h-[400px]">
                    {/* Floating pill for active user stats */}
                    <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 pointer-events-none">
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Showing <span className="text-blue-600 dark:text-blue-400 text-sm">{markers.length}</span> Results
                        </p>
                    </div>

                    <MapContainer markers={markers} defaultCenter={center} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LocationMap;
