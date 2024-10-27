const Loader = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-b-transparent animate-spin border-blue-500"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  };
  
  export default Loader;
  