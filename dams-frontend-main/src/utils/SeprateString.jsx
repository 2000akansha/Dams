// Function to seprate the string of rakhba khasra etc and map into column.
export const SeprateString = (string) => {
  const data = string.replace(/\s+/g, " ").split(" ");
  return (
    <div className="flex flex-col">
      {data.map((el, index) => {
        return <div key={index}>{el}</div>;
      })}
    </div>
  );
};

// Function to customize the string of rakhba khasra etc and add , in between.
export const CustomizeString = (string) => {
  return string.replace(/\s+/g, " ").split(" ").join(", ");
};
