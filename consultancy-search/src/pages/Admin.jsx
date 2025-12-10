import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import API from "../api/axios.js";

export default function Admin() {
  const [consultancies, setConsultancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchConsultancies = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/consultancies/");
      setConsultancies(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load consultancies. Please refresh the page.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (id) => {
    try {
      setVerifyingId(id);
      await API.put(`/admin/consultancies/verify/${id}/`);
      fetchConsultancies();
    } catch (err) {
      setError("Failed to verify consultancy. Please try again.");
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  useEffect(() => {
    fetchConsultancies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon
            icon="mdi:loading"
            className="text-4xl text-blue-600 animate-spin"
          />
          <p className="text-gray-600">Loading consultancies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Consultancy Management
      </h1>
      <p className="text-gray-600 mb-8">Review and verify consultancies</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <Icon
            icon="mdi:alert-circle"
            className="text-red-600 text-xl flex-shrink-0 mt-0.5"
          />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {consultancies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consultancies.map((c) => (
            <div
              key={c.id}
              className={`border rounded-lg p-6 transition ${
                c.is_verified
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {c.name}
                    </h2>
                    {c.is_verified && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <Icon icon="mdi:check-circle" className="text-base" />
                        Verified
                      </span>
                    )}
                    {!c.is_verified && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        <Icon icon="mdi:clock-outline" className="text-base" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {c.email}
                  </a>
                </div>
                {c.website && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Website</p>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm truncate"
                    >
                      {c.website}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 font-medium">Courses</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.courses && c.courses.length > 0 ? (
                      c.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {course.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No courses listed</p>
                    )}
                  </div>
                </div>
              </div>

              {!c.is_verified && (
                <button
                  onClick={() => verify(c.id)}
                  disabled={verifyingId === c.id}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  {verifyingId === c.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon
                        icon="mdi:loading"
                        className="text-lg animate-spin"
                      />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Consultancy"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Icon
            icon="mdi:briefcase-outline"
            className="text-6xl text-gray-300 mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">No consultancies to verify</p>
        </div>
      )}
    </div>
  );
}
