const LoginLayout = ({ children, topBanner }) => {
  return (
    <>
      <div className="flex flex-wrap justify-center page-center items-center gap-4 lg:gap-12">
        <div className="">
          {topBanner && (
            <div className="mb-4 w-[300px]">
              {topBanner}
            </div>
          )}
          <img
            src="/logo2.svg"
            alt="campus web"
            className="mx-auto w-[300px] h-auto"
          />
        </div>
        <div className="w-[350px] mt-3 ">
            {children}
        </div>
      </div>
    </>
  );
}

export default LoginLayout;