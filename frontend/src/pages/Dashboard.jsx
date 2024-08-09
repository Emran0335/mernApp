import React, { useEffect } from "react";
import PropertyForm from "../components/PropertyForm";
import PropertyItem from "../components/PropertyItem";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProperties, reset } from "../features/property/propertySlice";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { propertise, isLoading, isError, message } = useSelector(
    (state) => state.propertise
  );
  console.log("propertise", propertise);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (!user) {
      navigate("/login");
    }
    const filters = {
      _end: 10,
      _start: 0,
      _order: "asc",
      _sort: "createdAt",
      title_like: "house",
      propertyType: "apartment",
    };
    dispatch(getProperties(filters));
    return () => {
      dispatch(reset());
    };
  }, [navigate, user, isError, message, dispatch]);

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <>
      <section className="heading">
        <h1>Welcome, {user && user.name}</h1>
        <p>Property Dashboard</p>
      </section>
      <PropertyForm />
      <section className="content">
        {propertise.length > 0 ? (
          <div className="propertise">
            {propertise.map((property) => (
              <PropertyItem key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <h3>You have not yet set any property!</h3>
        )}
      </section>
    </>
  );
};

export default Dashboard;
