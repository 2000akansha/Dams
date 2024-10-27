// Filter data with respect to village
export const filterByVillageId = (data, villageId) => {
  // Have to change villageName to villageId
  return data.filter((item) => item.villageName === villageId);
};

// Filter data with respect to khatauni
export const filterByKhatauni = (beneficiariesList, selectedKhatauni) => {
  return beneficiariesList?.filter((item) =>
    selectedKhatauni.includes(item.khatauniSankhya.toString())
  );
};

// Group beneficiaries by khatauniSankhya
export const groupByKhatauni = (beneficiariesList) => {
  const groupedData = beneficiariesList?.reduce((acc, item) => {
    const { khatauniSankhya } = item;
    if (!acc[khatauniSankhya]) {
      acc[khatauniSankhya] = [];
    }
    acc[khatauniSankhya].push(item);
    return acc;
  }, {});
  // Sorting the beneficiaries within each khatauni group by serialNumber
  Object.keys(groupedData).forEach((khatauniSankhya) => {
    groupedData[khatauniSankhya] = groupedData[khatauniSankhya].sort(
      (a, b) => a.serialNumber - b.serialNumber
    );
  });
  return groupedData;
};

// Fetch all khatauni within the village
export const getKhatauniOptions = (beneficiaryList, villageName) => {
  return beneficiaryList
    ?.filter((item) => !villageName || item.villageName === villageName)
    .map((item) => item.khatauniSankhya);
};
