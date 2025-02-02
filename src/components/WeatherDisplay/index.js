/*
 * @Author: Leo
 * @Date: 2022-09-29 16:25:10
 * @LastEditors: Leo
 * @LastEditTime: 2022-10-02 19:04:29
 * @FilePath: \coding-challenge-frontend\src\components\WeatherDisplay\index.js
 * @Description:
 */
import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import WeatherCard from '../WeatherCard';
import Skeleton from '@mui/material/Skeleton';
import WeatherService from '../../Apis/WeatherService';
import LocationService from '../../Apis/LocationService';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useSelector } from 'react-redux';
import './index.scss';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const WeatherDisplay = () => {

    const [weatherInfo, setWeatherInfo] = React.useState([]);
    const [location, setLocation] = React.useState('');
    const [unit, setUnit] = React.useState(true);
    const [locationLoading, setLocationLoading] = React.useState(false);
    const [cardLoading, setCardLoading] = React.useState(false);
    const [error, setError] = React.useState({
        isOpen: false,
        message: ''
    });
    const locationInfo = useSelector(state => state.location);

    const getRemoteData = async () => {
        if (locationInfo.lat && locationInfo.lon) {
            try {
                setCardLoading(true);
                setLocationLoading(true);
                const res = await WeatherService.getWeatherByLocation(locationInfo.lat, locationInfo.lon);
                if (res.status === 200) {
                    const weather = res.data;
                    setWeatherInfo(() => {
                        const temp = weather.daily.slice(0, 3).map((item, index) => ({
                            timeStamp: item.dt,
                            weather: {
                                ...item.weather[0],
                                temp: item.temp
                            }
                        }));
                        return temp;
                    });
                }
                setCardLoading(false);
                const locationRes = await LocationService.getPlaceByLocation(locationInfo.lat, locationInfo.lon);
                if (locationRes.status === 200) {
                    const location = locationRes.data;
                    setLocation(location.results[0].formatted);
                }
                setLocationLoading(false);
            } catch(err) {
                setError({
                    isOpen: true,
                    message: err.response.data.message || err.response.data.status.message
                });
            }
        }
    };

    const handleSwitchUnit = () => {
        setUnit((prev) => !prev);
    };

    React.useEffect(() => {
        getRemoteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationInfo]);

    return (
        <Box className='weather-display-main animate__animated animate__fadeInUp'>

            <Snackbar
                open={error.isOpen}
                autoHideDuration={3000}
                onClose={() => setError({isOpen: false, message: ''})}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
            >
                <Alert onClose={() => setError({isOpen: false, message: ''})} severity="error" sx={{ width: '100%' }}>
                    {error.message}
                </Alert>
            </Snackbar>

            <Box
                className={`weather-display-local-mark animate__animated ${locationInfo.isLocal ? 'animate__zoomIn' : 'animate__zoomOut'}`}
            >
                <Chip label='Current Location' variant="outlined" color="primary" size='small' />
            </Box>
            <Box className='weather-display-city-name'>
                {
                    locationLoading ?
                    <Box p='0 10%'>
                        <Skeleton variant="rectangular" width='100%' height={60} sx={{borderRadius: 30}} />
                    </Box> :
                    <Box>
                        {location}
                    </Box>
                }
            </Box>
            <Box className='weather-display-container'>
                {
                    cardLoading ?
                    [1, 2, 3].map((item) => (
                        <Box className='weather-card-loading-main' key={item}>
                            <Skeleton variant="rounded" width={70} height={32} sx={{borderRadius: 16}} />
                            <Skeleton variant="rectangular" width='90%' height={20} sx={{mt: 3, borderRadius: 2}} />
                            <Skeleton variant="rectangular" width='90%' height={150} sx={{mt: 3, borderRadius: 4}} />
                            <Skeleton variant="rectangular" width='50%' height={60} sx={{mt: 3, borderRadius: 30}} />
                            <Skeleton variant="rectangular" width='50%' height={20} sx={{mt: 3, borderRadius: 10}} />
                            <Skeleton variant="rectangular" width='60%' height={40} sx={{mt: 3, borderRadius: 20}} />
                        </Box>
                    )) :
                    weatherInfo.map((item, index) => (
                        <WeatherCard
                            key={item.timeStamp}
                            index={index}
                            info={item}
                            unit={unit}
                            handleSwitchUnit={handleSwitchUnit}
                        />
                    ))
                }
            </Box>
        </Box>
    );
};

export default WeatherDisplay;