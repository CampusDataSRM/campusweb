import html2canvas from "html2canvas";

export const downloadImage = async (elementToPrintId) => {
  const element = document.getElementById(elementToPrintId);
  if (!element) {
    throw new Error(`Element with id ${elementToPrintId} not found`);
  }
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#000", margin: 20 });
  const data = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = data;
  link.download = "timetable.png";
  link.click();
};
