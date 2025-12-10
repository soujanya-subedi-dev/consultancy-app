// pages/Home.jsx
import { Icon } from "@iconify/react";
import { useState } from "react";
import API from "../api/axios.js";
import AdsImage from "../assets/advertisement.jpg";
import HeroImage from "../assets/hero-image.jpg";

const COUNTRY_LIST = [
  { code: "NP", name: "Nepal" },
  { code: "US", name: "USA" },
  { code: "UK", name: "UK" },
  { code: "IN", name: "India" },
  { code: "AU", name: "Australia" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [courseNames, setCourseNames] = useState([]);

  const searchConsultancy = async () => {
    if (!query && !country) {
      setError("Please enter a course or select a country.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.get(`/search/?query=${query}&country=${country}`);
      const data = res.data;

      setResults(data);

      // Collect all course names for suggestions
      const allCourses = [
        ...new Set(data.map((c) => c.courses.map((x) => x.name)).flat()),
      ];
      setCourseNames(allCourses);
    } catch (err) {
      setError("Failed to fetch consultancies. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = courseNames.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectSuggestion = (c) => {
    setQuery(c);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero Section */}
      <section
        className="relative flex flex-col justify-center text-white"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex justify-between items-start max-w-6xl w-full py-6 px-4">
          <div className="text-2xl font-bold text-white pl-2">EduSearch</div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 pt-12 pb-20">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Find the Best Consultancy for Your Course Abroad
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            Search for courses and discover trusted consultancies worldwide.
          </p>

          {/* Search Section */}
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center w-full max-w-3xl sm:justify-end">
            {/* Course Input */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search course"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="px-4 py-2 rounded-xl w-full sm:w-80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
              {showSuggestions && query && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-62 bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                  {filteredSuggestions.map((c, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black text-left border-b last:border-b-0"
                      onClick={() => handleSelectSuggestion(c)}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Country Select */}
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-4 py-2 rounded-xl w-full sm:w-64 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Select Country</option>
              {COUNTRY_LIST.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button
              onClick={searchConsultancy}
              className="px-6 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Search Results + Sidebar Ad */}
      <section className="w-full py-10 flex flex-col sm:flex-row gap-10 justify-between px-6 sm:px-10">
        {/* Results Section */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:loading"
                className="text-2xl text-blue-600 animate-spin"
              />
              <p className="text-gray-600 font-semibold text-lg">Loading...</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <Icon
                icon="mdi:alert-circle"
                className="text-red-600 text-xl flex-shrink-0 mt-0.5"
              />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm font-medium">
                Found {results.length} consultancy
                {results.length !== 1 ? "ies" : ""} matching your search
              </p>
            </div>
          )}

          {results.length > 0 ? (
            <ul className="flex flex-col w-full max-w-2xl space-y-4">
              {results.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  {c.profile_image && (
                    <img
                      src={`http://localhost:8000${c.profile_image}`}
                      alt={c.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col text-left flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {c.name}
                    </p>

                    {/* Courses with tags */}
                    {c.courses.length > 0 && (
                      <ul className="text-gray-700 text-sm mb-1 list-disc ml-5">
                        {c.courses.map((course) => (
                          <li key={course.id}>
                            {course.name} ({course.tags.join(", ")})
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Countries */}
                    {c.countries_operated.length > 0 && (
                      <p className="text-gray-700 text-sm mb-1">
                        Countries: {c.countries_operated.join(", ")}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                      {c.address && (
                        <div className="flex items-center gap-1">
                          <Icon
                            icon="mdi:map-marker-outline"
                            className="text-gray-400 text-base"
                          />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              c.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline"
                          >
                            {c.address}
                          </a>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1">
                          <Icon
                            icon="mdi:email-outline"
                            className="text-gray-400 text-base"
                          />
                          <a
                            href={`mailto:${c.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline"
                          >
                            {c.email}
                          </a>
                        </div>
                      )}
                      {c.phone_no && (
                        <div className="flex items-center gap-1">
                          <Icon
                            icon="mdi:phone-outline"
                            className="text-gray-400 text-base"
                          />
                          <a
                            href={`https://wa.me/${c.phone_no.replace(
                              /[^\d]/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline"
                          >
                            {c.phone_no}
                          </a>
                        </div>
                      )}
                      {c.website && (
                        <div className="flex items-center gap-1">
                          <Icon
                            icon="mdi:web"
                            className="text-gray-400 text-base"
                          />
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="max-w-2xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
                  <Icon
                    icon="mdi:magnify"
                    className="text-5xl text-blue-400 mx-auto mb-4"
                  />
                  <p className="text-gray-700 font-semibold text-lg mb-2">
                    No consultancies found
                  </p>
                  <p className="text-gray-600 text-sm">
                    Try searching with different keywords or selecting a
                    different country
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Sidebar Ad */}
        <aside className="w-full sm:w-[460px] bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition overflow-hidden self-start cursor-pointer">
          <div className="overflow-hidden">
            <img
              src={AdsImage}
              alt="Study Abroad Ad"
              className="w-full h-45 object-cover transform transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="p-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Study Abroad with Global Scholars 🌍
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Apply now for top universities in Australia, Canada, UK, and the
              USA. Get expert visa guidance and scholarships up to 100%.
            </p>
            <button
              onClick={() =>
                window.open("https://www.globalscholars.com", "_blank")
              }
              className="w-full px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Learn More
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
