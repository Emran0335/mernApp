import axios from "axios";

// creating new properties
const createProperty = async (propertyData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(
    "http://localhost:8080/api/v1/propertise",
    propertyData,
    config
  );
  return response.data;
};

// get propertise
const getProperties = async (filters, token) => {
  const { _end, _start, _order, _sort, title_like, propertyType } = filters;
  const query = new URLSearchParams({
    _end,
    _start,
    _order,
    _sort,
    title_like,
    propertyType,
  }).toString();
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(
    `http://localhost:8080/api/v1/properties?${query}`,
    config
  );
  return response.data;
};

// update propertise
const updatePropertise = async (propertyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(
    `http://localhost:8080/api/v1/propertise/${propertyId}`,
    config
  );
  return response.data;
};

const deleteProperty = async (propertyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(
    `http://localhost:8080/api/v1/propertise/${propertyId}`,
    config
  );
  return response.data;
};

const propertyService = {
  createProperty,
  getProperties,
  updatePropertise,
  deleteProperty,
};

export default propertyService;
