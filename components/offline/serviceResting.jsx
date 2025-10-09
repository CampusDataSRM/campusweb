const ServiceResting = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen p-3">
        <img
          src="/logo2.svg"
          alt="campus web"
          className="mx-auto w-[120px] md:w-[190px] h-auto mb-5 mt-1"
        />
        <div className="theme_box_bg p-6 md:p-8 max-w-2xl mx-auto rounded-xl shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-2xl md:text-3xl font-bold text-theme_text_primary">
              🚨 OPERATION BUG HUNT �
            </div>

            <div className="text-theme_text_primary text-base md:text-lg leading-relaxed">
              <p className="mb-4">
                🕵️ <strong>Status:</strong> Our dev squad has been pulled from 'Real Life' to squash a few unexpected bugs. They're on it! 🌳
              </p>
            </div>

            <div className="p-5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl border border-green-200 dark:border-green-700">
              <p className="text-green-800 dark:text-green-200 font-semibold text-lg">
                🎯 <strong>BACK ONLINE:</strong> October 10th, 2025 at 8:00 AM ⏰
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                🚀 All systems will be fully operational by morning!
              </p>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              🤖 <em>Definitely-Not-Panicking-Dev-Team-Bot-3000</em>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceResting;
