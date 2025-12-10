import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import API from "../api/axios.js";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("consultancies");
  const [consultancies, setConsultancies] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch data
  const fetchConsultancies = async () => {
    try {
      const res = await API.get("/admin/consultancies/");
      setConsultancies(res.data);
    } catch (err) {
      setError("Failed to load consultancies");
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users/");
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/admin/courses/");
      setCourses(res.data);
    } catch (err) {
      setError("Failed to load courses");
      console.error(err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchConsultancies(), fetchUsers(), fetchCourses()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  // ===== CONSULTANCY OPERATIONS =====
  const handleCreateConsultancy = async () => {
    try {
      await API.post("/admin/consultancies/", formData);
      setShowModal(false);
      setFormData({});
      fetchConsultancies();
    } catch (err) {
      setError("Failed to create consultancy");
      console.error(err);
    }
  };

  const handleUpdateConsultancy = async () => {
    try {
      await API.put(`/admin/consultancies/${editingId}/`, formData);
      setShowModal(false);
      setFormData({});
      setEditingId(null);
      fetchConsultancies();
    } catch (err) {
      setError("Failed to update consultancy");
      console.error(err);
    }
  };

  const handleDeleteConsultancy = async (id) => {
    if (window.confirm("Are you sure you want to delete this consultancy?")) {
      try {
        await API.delete(`/admin/consultancies/${id}/`);
        fetchConsultancies();
      } catch (err) {
        setError("Failed to delete consultancy");
        console.error(err);
      }
    }
  };

  const openConsultancyModal = (consultancy = null) => {
    setModalType("consultancy");
    if (consultancy) {
      setEditingId(consultancy.id);
      setFormData(consultancy);
    } else {
      setFormData({
        name: "",
        address: "",
        email: "",
        website: "",
        countries_operated: [],
      });
    }
    setShowModal(true);
  };

  // ===== USER OPERATIONS =====
  const handleCreateUser = async () => {
    try {
      await API.post("/admin/users/", formData);
      setShowModal(false);
      setFormData({});
      fetchUsers();
    } catch (err) {
      setError("Failed to create user");
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await API.put(`/admin/users/${editingId}/`, formData);
      setShowModal(false);
      setFormData({});
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/admin/users/${id}/`);
        fetchUsers();
      } catch (err) {
        setError("Failed to delete user");
        console.error(err);
      }
    }
  };

  const openUserModal = (user = null) => {
    setModalType("user");
    if (user) {
      setEditingId(user.id);
      setFormData(user);
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        is_consultancy: false,
      });
    }
    setShowModal(true);
  };

  // ===== COURSE OPERATIONS =====
  const handleCreateCourse = async () => {
    try {
      await API.post("/admin/courses/", formData);
      setShowModal(false);
      setFormData({});
      fetchCourses();
    } catch (err) {
      setError("Failed to create course");
      console.error(err);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      await API.put(`/admin/courses/${editingId}/`, formData);
      setShowModal(false);
      setFormData({});
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      setError("Failed to update course");
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await API.delete(`/admin/courses/${id}/`);
        fetchCourses();
      } catch (err) {
        setError("Failed to delete course");
        console.error(err);
      }
    }
  };

  const openCourseModal = (course = null) => {
    setModalType("course");
    if (course) {
      setEditingId(course.id);
      setFormData(course);
    } else {
      setFormData({ name: "", tags: [], consultancy: "" });
    }
    setShowModal(true);
  };

  // ===== MODAL COMPONENTS =====
  const ConsultancyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Edit Consultancy" : "Create Consultancy"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="Website"
            value={formData.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editingId) {
                  handleUpdateConsultancy();
                } else {
                  handleCreateConsultancy();
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({});
                setEditingId(null);
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const UserModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Edit User" : "Create User"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username || ""}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!editingId && (
            <input
              type="password"
              placeholder="Password"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_consultancy || false}
              onChange={(e) =>
                setFormData({ ...formData, is_consultancy: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span>Is Consultancy</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editingId) {
                  handleUpdateUser();
                } else {
                  handleCreateUser();
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({});
                setEditingId(null);
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Edit Course" : "Create Course"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Course Name"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={
              typeof formData.tags === "string"
                ? formData.tags
                : formData.tags?.join(", ") || ""
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value.split(",").map((t) => t.trim()),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={formData.consultancy || ""}
            onChange={(e) =>
              setFormData({ ...formData, consultancy: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Consultancy</option>
            {consultancies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editingId) {
                  handleUpdateCourse();
                } else {
                  handleCreateCourse();
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                setFormData({});
                setEditingId(null);
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Manage consultancies, users, and courses
        </p>

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
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            {
              id: "consultancies",
              label: "Consultancies",
              icon: "mdi:briefcase",
            },
            { id: "users", label: "Users", icon: "mdi:account-multiple" },
            { id: "courses", label: "Courses", icon: "mdi:book-multiple" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon icon={tab.icon} className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Consultancies Tab */}
        {activeTab === "consultancies" && (
          <div>
            <button
              onClick={() => openConsultancyModal()}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Icon icon="mdi:plus" className="text-lg" />
              Add Consultancy
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultancies.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="font-bold text-lg mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Email: {c.email}</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Address: {c.address}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openConsultancyModal(c)}
                      className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteConsultancy(c.id)}
                      className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <button
              onClick={() => openUserModal()}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Icon icon="mdi:plus" className="text-lg" />
              Add User
            </button>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border border-gray-200">
                    <th className="px-4 py-2 text-left font-semibold">
                      Username
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Email</th>
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{u.username}</td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.is_consultancy
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.is_consultancy ? "Consultancy" : "Admin"}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() => openUserModal(u)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div>
            <button
              onClick={() => openCourseModal()}
              className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Icon icon="mdi:plus" className="text-lg" />
              Add Course
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="font-bold text-lg mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Consultancy: {c.consultancy_name || "N/A"}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openCourseModal(c)}
                      className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {showModal && modalType === "consultancy" && <ConsultancyModal />}
        {showModal && modalType === "user" && <UserModal />}
        {showModal && modalType === "course" && <CourseModal />}
      </div>
    </div>
  );
}
