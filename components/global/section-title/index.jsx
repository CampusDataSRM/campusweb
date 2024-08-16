const SectionTitle = ({ title, icon }) => {
  return (
    <>
      <div className="text-theme_text_primary flex justify-start items-center gap-3 text-xl py-6 font-semibold">
        {icon && (
          <span>
            <img src={icon} alt={title} className="h-6 w-auto -mt-1" />
          </span>
        )}
        {title && title}
      </div>
    </>
  );
};

export default SectionTitle;
