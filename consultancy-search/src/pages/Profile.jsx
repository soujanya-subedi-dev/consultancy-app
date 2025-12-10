// pages/Profile.jsx
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios.js";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  // Form states
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({});
  const [newCourse, setNewCourse] = useState({ name: "", tags: "" });
  const [editingCourse, setEditingCourse] = useState(null);
  const [linkingCourses, setLinkingCourses] = useState([]);

  // Loading states
  const [savingInfo, setSavingInfo] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch profile and available courses
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profile/");
      setProfile(res.data);
      setInfoForm(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const res = await API.get("/admin/courses/");
      setAvailableCourses(res.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAvailableCourses();
  }, []);

  // Update consultancy info
  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      await API.put("/profile/", infoForm);
      setProfile(infoForm);
      setEditingInfo(false);
      setError("");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSavingInfo(false);
    }
  };

  // Upload logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("profile_image", logoFile);
      await API.put("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoFile(null);
      setLogoPreview(null);
      fetchProfile();
    } catch (err) {
      setError("Failed to upload logo");
      console.error(err);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Add new course
  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      setError("Course name is required");
      return;
    }

    try {
      setAddingCourse(true);
      await API.post("/courses/add/", {
        name: newCourse.name,
        tags: newCourse.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });
      setNewCourse({ name: "", tags: "" });
      setError("");
      fetchProfile();
    } catch (err) {
      setError("Failed to add course");
      console.error(err);
    } finally {
      setAddingCourse(false);
    }
  };

  // Edit course
  const handleEditCourse = async () => {
    if (!editingCourse.name.trim()) {
      setError("Course name is required");
      return;
    }

    try {
      setUpdatingCourse(true);
      await API.put(`/courses/edit/${editingCourse.id}/`, {
        name: editingCourse.name,
        tags: editingCourse.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      });
      setEditingCourse(null);
      setError("");
      fetchProfile();
    } catch (err) {
      setError("Failed to update course");
      console.error(err);
    } finally {
      setUpdatingCourse(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      setDeletingId(id);
      await API.delete(`/courses/delete/${id}/`);
      fetchProfile();
    } catch (err) {
      setError("Failed to delete course");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Link/Unlink courses
  const handleLinkCourse = async (courseId) => {
    try {
      await API.post(`/courses/link/`, { course_id: courseId });
      fetchProfile();
    } catch (err) {
      setError("Failed to link course");
      console.error(err);
    }
  };

  const handleUnlinkCourse = async (courseId) => {
    try {
      await API.post(`/courses/unlink/`, { course_id: courseId });
      fetchProfile();
    } catch (err) {
      setError("Failed to unlink course");
      console.error(err);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;

    try {
      await API.delete("/profile/");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      setError("Failed to delete account");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon
            icon="mdi:loading"
            className="text-4xl text-blue-600 animate-spin"
          />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                {profile.is_verified ? (
                  <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <Icon icon="mdi:check-circle" className="text-base" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    <Icon icon="mdi:clock-outline" className="text-base" />
                    Pending Verification
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <Icon icon="mdi:logout" className="text-lg" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <Icon
              icon="mdi:alert-circle"
              className="text-red-600 text-xl flex-shrink-0 mt-0.5"
            />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white rounded-lg shadow-sm p-1">
          {[
            { id: "info", label: "Consultancy Info", icon: "mdi:information" },
            { id: "courses", label: "Courses", icon: "mdi:book-multiple" },
            { id: "settings", label: "Settings", icon: "mdi:cog" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon icon={tab.icon} className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Logo Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Logo</h2>
                <div className="bg-gray-100 rounded-lg p-6 text-center mb-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-40 w-40 object-cover rounded-lg mx-auto"
                    />
                  ) : profile.profile_image ? (
                    <img
                      src={`http://localhost:8000${profile.profile_image}`}
                      alt={profile.name}
                      className="h-40 w-40 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="h-40 w-40 bg-gray-300 rounded-lg mx-auto flex items-center justify-center">
                      <Icon
                        icon="mdi:image-outline"
                        className="text-4xl text-gray-400"
                      />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="mb-3 w-full"
                />
                <button
                  onClick={uploadLogo}
                  disabled={!logoFile || uploadingLogo}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Consultancy Information
                  </h2>
                  {!editingInfo && (
                    <button
                      onClick={() => setEditingInfo(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      <Icon icon="mdi:pencil" className="text-lg" />
                      Edit
                    </button>
                  )}
                </div>

                {editingInfo ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={infoForm.name || ""}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={infoForm.email || ""}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={infoForm.address || ""}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={infoForm.website || ""}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, website: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Countries Operating
                      </label>
                      <input
                        type="text"
                        placeholder="Comma separated (e.g., USA, UK, Canada)"
                        value={
                          typeof infoForm.countries_operated === "string"
                            ? infoForm.countries_operated
                            : infoForm.countries_operated?.join(", ") || ""
                        }
                        onChange={(e) =>
                          setInfoForm({
                            ...infoForm,
                            countries_operated: e.target.value
                              .split(",")
                              .map((c) => c.trim()),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSaveInfo}
                        disabled={savingInfo}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        {savingInfo ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingInfo(false);
                          setInfoForm(profile);
                        }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Address
                      </p>
                      <p className="text-gray-900">{profile.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Website
                      </p>
                      <p className="text-gray-900">
                        {profile.website || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Countries Operating
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.countries_operated?.length > 0 ? (
                          profile.countries_operated.map((country, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {country}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No countries set</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Your Courses */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Your Courses
                </h2>

                {profile.courses?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.courses.map((c) => (
                      <div
                        key={c.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        {editingCourse?.id === c.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingCourse.name || ""}
                              onChange={(e) =>
                                setEditingCourse({
                                  ...editingCourse,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Course name"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={editingCourse.tags || ""}
                              onChange={(e) =>
                                setEditingCourse({
                                  ...editingCourse,
                                  tags: e.target.value,
                                })
                              }
                              placeholder="Tags (comma separated)"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleEditCourse}
                                disabled={updatingCourse}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
                              >
                                {updatingCourse ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingCourse(null)}
                                className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {c.name}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {c.tags?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() =>
                                  setEditingCourse({
                                    id: c.id,
                                    name: c.name,
                                    tags: c.tags?.join(", ") || "",
                                  })
                                }
                                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(c.id)}
                                disabled={deletingId === c.id}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm disabled:opacity-50"
                              >
                                {deletingId === c.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No courses added yet
                  </p>
                )}

                {/* Add New Course */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add New Course
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Course name"
                      value={newCourse.name}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Tags (comma separated)"
                      value={newCourse.tags}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, tags: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddCourse}
                      disabled={addingCourse}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {addingCourse ? "Adding..." : "Add Course"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Courses */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Link Existing Courses
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select courses from the system to link with your consultancy
                </p>

                {availableCourses.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableCourses.map((course) => {
                      const isLinked = profile.courses?.some(
                        (c) => c.id === course.id
                      );
                      return (
                        <div
                          key={course.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <p className="font-medium text-sm text-gray-900">
                            {course.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {course.consultancy_name &&
                              `By: ${course.consultancy_name}`}
                          </p>
                          <button
                            onClick={() => {
                              if (isLinked) {
                                handleUnlinkCourse(course.id);
                              } else {
                                handleLinkCourse(course.id);
                              }
                            }}
                            className={`mt-2 w-full px-2 py-1 text-xs font-semibold rounded transition ${
                              isLinked
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {isLinked ? "Unlink" : "Link"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No courses available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                {/* Delete Account */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Deleting your account is permanent and cannot be undone. All
                    your data will be deleted.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                  >
                    <Icon icon="mdi:delete" className="text-lg" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
