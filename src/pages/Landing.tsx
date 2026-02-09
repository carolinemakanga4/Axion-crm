import React from "react";
import { useNavigate } from "react-router-dom";


const Landing: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="bg-slate-50 text-slate-900">

      {/* Hero Section */}
      <section className="text-center py-24 bg-indigo-600 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Power Your Business With Axion CRM
        </h1>

        <p className="mb-6 text-lg">
          Manage customers, leads, and sales in one powerful dashboard.
        </p>

  <button
  onClick={() => navigate("/login")}
  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
>
  Get Started Free
</button>


      </section>

      {/* Features Section */}
      <section className="py-20 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">

        {[
          "Smart Dashboard",
          "Lead Management",
          "Customer Profiles",
          "Cloud Sync",
          "Secure Login",
          "Real-Time Reports",
        ].map((feature: string) => (
          <div
            key={feature}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-bold mb-2">{feature}</h3>
            <p className="text-sm text-gray-600">
              Built to help you scale faster.
            </p>
          </div>
        ))}

      </section>

    </div>
  );
};

export default Landing;
