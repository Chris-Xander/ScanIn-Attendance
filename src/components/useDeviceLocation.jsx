import { useState } from "react";

function useDeviceLocation() {
    const [location, setLocation] =useState("");
    const [error, setError] = useState(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Location is not supported by your browser: Please allow location access and try again.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation(`${latitude},${longitude}`);
            },
            (err) => {
                setError(err.message);
            }
        );
    };

    return { location, error, getLocation};
}

export default useDeviceLocation;