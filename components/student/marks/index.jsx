const SubjectGrade = () => {
    const grades = []
    return (
        <>
        <div className="theme_box_bg px-4 py-5 flex flex-col gap-4 justify-center">
            <div className="flex justify-between gap-4 items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-theme_text_normal">Semiconductor Physics and Computational Model</span>
                    <span className="text-sm font-semibold text-theme_text_normal_60">21PYB102J - Theory</span>
                </div>
                <div className="text-theme_primary font-bold flex items-end gap-[2px] pr-3">
                    <span className="text-3xl ">45</span>
                    <span className="text-lg ">/</span>
                    <span className="text-lg ">60</span>
                </div>
            </div>
        </div>
        </>
    );
}; 

export default SubjectGrade;