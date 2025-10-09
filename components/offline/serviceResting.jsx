const ServiceResting = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen p-3">
        <img
          src="/logo2.svg"
          alt="campus web"
          className="mx-auto w-[120px] md:w-[190px] h-auto mb-5 mt-1"
        />
        <div className="theme_box_bg p-5 md:p-7 max-w-4xl mx-auto rounded-lg shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-lg md:text-xl font-bold text-theme_text_primary">
              🚨 TOP SECRET TRANSMISSION 🚨
            </div>

            <div className="text-red-500 font-mono text-sm md:text-base animate-pulse">
              🔒 CLASSIFIED: OPERATION TOUCH GRASS 🔒
            </div>

            <div className="text-theme_text_primary text-sm md:text-base leading-relaxed space-y-3">
              <p>
                🕵️ <strong>Agent Portal Status:</strong> TEMPORARILY OFFLINE 🕵️
              </p>

              <p>
                📋 <strong>Mission Brief:</strong> Our elite dev squad has been
                infiltrated by a mysterious organization called{" "}
                <em>"Real Life"</em>
                🌳 They're currently undergoing intensive training in something
                called "work-life balance" (intelligence suggests it involves
                sunlight ☀️)
              </p>

              <p>
                🖥️ <strong>Server Status:</strong> Our databases are in witness
                protection after reporting exhaustion from processing too many
                student queries 😴
              </p>

              <p>
                📍 <strong>Current Location:</strong> Somewhere without WiFi
                signals... our agents are reportedly experiencing withdrawal
                symptoms 📶❌
              </p>

              <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ <strong>URGENT:</strong> This transmission will
                  self-destruct when we remember our GitHub passwords 💥
                </p>
              </div>

              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-4">
                🤖 Automated message from:{" "}
                <em>Definitely-Not-Panicking-Dev-Team-Bot-3000</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceResting;
