import React from "react";
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import Offerspage from "./OffersPage.jsx";
import ShopsPage from "./Shopspage.jsx";

const Home = () => {
  return (
    <div className="mt-10">
      {/* 🔹 Just the main sections */}
      <Banner />
      <Categories />
      <Offerspage />
      <ShopsPage />
    </div>
  );
};

export default Home;
