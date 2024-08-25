const toTitleCase = (str) => {
  return str?.toLocaleLowerCase().replace(/\b\w/g, function (char) {
    return char?.toUpperCase();
  });
};
export { toTitleCase };
