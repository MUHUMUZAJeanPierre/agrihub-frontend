import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer } from 'lucide-react';

const WeatherComp = () => {
  const [location, setLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState('New York, NY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  // Mock weather data generator
  const generateWeatherData = (locationName, period) => {
    const baseTemp = Math.floor(Math.random() * 20) + 15;
    const periods = {
      today: {
        current: {
          temp: baseTemp + Math.floor(Math.random() * 10),
          condition: 'Partly Cloudy',
          humidity: Math.floor(Math.random() * 30) + 60,
          windSpeed: Math.floor(Math.random() * 15) + 5,
          visibility: Math.floor(Math.random() * 5) + 8,
          pressure: Math.floor(Math.random() * 50) + 1000,
          icon: 'partly-cloudy'
        },
        hourly: Array.from({ length: 24 }, (_, i) => ({
          time: `${i.toString().padStart(2, '0')}:00`,
          temp: baseTemp + Math.floor(Math.random() * 8) - 4,
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy'][Math.floor(Math.random() * 3)],
          icon: ['sun', 'cloud', 'partly-cloudy'][Math.floor(Math.random() * 3)]
        }))
      },
      week: {
        daily: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            high: baseTemp + Math.floor(Math.random() * 8),
            low: baseTemp - Math.floor(Math.random() * 8),
            condition: ['Sunny', 'Rainy', 'Cloudy', 'Partly Cloudy', 'Stormy'][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 40) + 50,
            icon: ['sun', 'rain', 'cloud', 'partly-cloudy', 'storm'][Math.floor(Math.random() * 5)]
          };
        })
      },
      month: {
        weekly: Array.from({ length: 4 }, (_, i) => ({
          week: `Week ${i + 1}`,
          avgHigh: baseTemp + Math.floor(Math.random() * 6),
          avgLow: baseTemp - Math.floor(Math.random() * 6),
          condition: ['Mostly Sunny', 'Mixed', 'Mostly Cloudy', 'Variable'][Math.floor(Math.random() * 4)],
          precipitation: Math.floor(Math.random() * 30) + 10
        }))
      }
    };
    
    return { location: locationName, ...periods[period] };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentLocation(searchQuery);
    setLocation(searchQuery);
    const data = generateWeatherData(searchQuery, selectedPeriod);
    setWeatherData(data);
    setIsSearching(false);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const data = generateWeatherData(currentLocation, period);
    setWeatherData(data);
  };

  // Initialize with default data
  useEffect(() => {
    const initialData = generateWeatherData(currentLocation, selectedPeriod);
    setWeatherData(initialData);
  }, []);

  const getWeatherIcon = (iconType) => {
    switch (iconType) {
      case 'sun': return <Sun className="w-8 h-8 text-yellow-400" />;
      case 'cloud': return <Cloud className="w-8 h-8 text-gray-400" />;
      case 'rain': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case 'snow': return <CloudSnow className="w-8 h-8 text-blue-200" />;
      case 'storm': return <CloudRain className="w-8 h-8 text-purple-400" />;
      default: return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  const renderTodayView = () => {
    if (!weatherData?.current) return null;
    
    const { current, hourly } = weatherData;
    
    return (
      <div className="space-y-5">
        {/* Hourly Forecast */}
        <div className="p-6 bg-white shadow-lg rounded-2xl">
          <h3 className="mb-4 text-lg font-semibold">24-Hour Forecast</h3>
          <div className="flex pb-2 space-x-4 overflow-x-auto">
            {hourly.slice(0, 12).map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center bg-gray-50 rounded-xl p-3 min-w-[70px]">
                <p className="text-sm text-gray-600">{hour.time}</p>
                <div className="flex justify-center my-2">
                  {getWeatherIcon(hour.icon)}
                </div>
                <p className="text-sm font-semibold">{hour.temp}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    if (!weatherData?.daily) return null;
    
    return (
      <div className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold">7-Day Forecast</h3>
        <div className="space-y-4">
          {weatherData.daily.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 text-center">
                  <p className="text-sm font-medium">{day.date}</p>
                </div>
                {getWeatherIcon(day.icon)}
                <div>
                  <p className="font-medium">{day.condition}</p>
                  <p className="text-sm text-gray-600">Humidity: {day.humidity}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{day.high}°/{day.low}°</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    if (!weatherData?.weekly) return null;
    
    return (
      <div className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="mb-4 text-lg font-semibold">Monthly Overview</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {weatherData.weekly.map((week, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl">
              <h4 className="mb-2 font-medium">{week.week}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg High:</span>
                  <span className="font-semibold">{week.avgHigh}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Low:</span>
                  <span className="font-semibold">{week.avgLow}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Condition:</span>
                  <span className="font-semibold">{week.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precipitation:</span>
                  <span className="font-semibold">{week.precipitation}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeatherContent = () => {
    switch (selectedPeriod) {
      case 'today':
        return renderTodayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderTodayView();
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Weather App</h1>
          <p className="text-gray-600">Get weather information for any location</p>
        </div>

        {/* Search Section */}
        <div className="p-6 mb-6 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center mb-4 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search for a city or location..."
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 mb-4 space-x-2 bg-orange-100 border border-orange-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-800">{error}</span>
            </div>
          )}

          {/* Current Location */}
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">{currentLocation}</span>
          </div>
        </div>

        {/* Period Selection */}
        <div className="p-6 mb-6 bg-white shadow-lg rounded-2xl">
          <div className="flex items-center mb-4 space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Select Time Period</h3>
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: '7 Days' },
              { key: 'month', label: 'Monthly' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => handlePeriodChange(period.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Content */}
        {weatherData && renderWeatherContent()}
      </div>
    </div>
  );
};

export default WeatherComp;