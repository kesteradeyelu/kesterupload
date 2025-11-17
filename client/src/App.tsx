import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./App.css";
import UploadManager from "./components/UploadManager";

interface UploadFormValues {
  title: string;
  description: string;
  tags: string;
  category: string;
  problem: string;
  solution: string;
  link: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  referral?: string;
  interests?: string[];
  message: string;
  createdAt: string;
}

const initialValues: UploadFormValues = {
  title: "",
  description: "",
  tags: "",
  category: "",
  problem: "",
  solution: "",
  link: "",
};

const UploadSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  tags: Yup.string().required("Tags are required"),
  category: Yup.string().required("Category is required"),
  problem: Yup.string().required("Problem is required"),
  solution: Yup.string().required("Solution is required"),
  link: Yup.string().required("Link is required"),
});

function App() {
  // 🔒 Session login overlay
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [error, setError] = useState("");
  const ENV_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("authorized");
    if (sessionAuth === "true") setIsAuthorized(true);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === ENV_PASSWORD) {
      setIsAuthorized(true);
      sessionStorage.setItem("authorized", "true");
    } else {
      setError("Invalid password");
    }
  };

  // 🧩 App states
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const apiUrl = "http://localhost:4000";

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/contact`);
      setContacts(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await axios.delete(`${apiUrl}/contact/${id}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Failed to delete contact:", error);
      alert("❌ Failed to delete contact.");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles(filesWithPreview);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL((file as any).preview));
    };
  }, [files]);

  const handleSubmit = async (
    values: UploadFormValues,
    helpers: FormikHelpers<UploadFormValues>
  ) => {
    setLoading(true);
    setMessage("");

    const data = new FormData();
    files.forEach((file) => data.append("images", file));
    Object.entries(values).forEach(([key, value]) => data.append(key, value));

    try {
      const response = await axios.post(`${apiUrl}/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      setMessage("✅ Upload successful!");
      setFiles([]);
      helpers.resetForm();
    } catch (error) {
      console.error(error);
      setMessage("❌ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6">

      {/* 🔒 Fixed Centered Overlay for session login */}
      {!isAuthorized && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-95 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🔐 Admin Access
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Enter password"
                className="px-4 py-2 rounded-md w-full border focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 transition"
              >
                Unlock
              </button>
            </form>
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </div>
        </div>
      )}

      {/* MAIN APP CONTENT */}
      <h1 className="text-4xl font-extrabold text-center text-gray-700 mb-8 tracking-tight">
        Kester Studios Uploads
      </h1>

      {/* CONTACTS SECTION */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          📬 Received Contacts
        </h2>
        {contacts.length === 0 ? (
          <p className="text-gray-500">No contact messages yet.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition flex justify-between items-start"
              >
                <div>
                  <p className="font-bold text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-600">
                    {contact.email} {contact.phone && `• ${contact.phone}`}
                  </p>
                  <p className="text-gray-700 mt-2">{contact.message}</p>
                  {contact.company && (
                    <p className="text-sm text-gray-500 mt-1">
                      Company: {contact.company}
                    </p>
                  )}
                  {contact.interests && contact.interests.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Interests: {contact.interests.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Sent on: {new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact._id)}
                  className="ml-4 text-red-500 hover:text-red-700 font-bold text-sm transition"
                  title="Delete message"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD FORM SECTION */}
      <Formik
        initialValues={initialValues}
        validationSchema={UploadSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full space-y-6">
            <div
              {...getRootProps()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                {isDragActive
                  ? "📂 Drop your images..."
                  : "Drag & drop images here, or click to select files"}
              </p>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="relative w-24 h-24 rounded overflow-hidden border border-gray-200"
                    >
                      <img
                        src={(file as any).preview}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-5">
              <div>
                <Field name="title" placeholder="Image Title" className="input-field" />
                <ErrorMessage name="title" component="div" className="error-text" />
              </div>
              <div>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Image Description"
                  rows={3}
                  className="input-field resize-none"
                />
                <ErrorMessage name="description" component="div" className="error-text" />
              </div>
              <div>
                <Field name="tags" placeholder="Tags (comma separated)" className="input-field" />
                <ErrorMessage name="tags" component="div" className="error-text" />
              </div>
              <div>
                <Field
                  as="textarea"
                  name="problem"
                  placeholder="Describe the Problem"
                  rows={3}
                  className="input-field resize-none"
                />
                <ErrorMessage name="problem" component="div" className="error-text" />
              </div>
              <div>
                <Field
                  as="textarea"
                  name="solution"
                  placeholder="Describe the Solution"
                  rows={3}
                  className="input-field resize-none"
                />
                
                <ErrorMessage name="solution" component="div" className="error-text" />
                <Field
                  as="textarea"
                  name="link"
                  placeholder="Drop link here"
                  rows={1}
                  className="input-field resize-none"
                />
                <ErrorMessage name="link" component="div" className="error-text" />
              </div>
              <div>
                <Field as="select" name="category" className="input-field">
                  <option value="">Select Category</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Blockchain Development">Blockchain Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="2D/3D design">2D/3D Design</option>
                  <option value="Game Development">Game Development</option>
                  <option value="App Development">App Development</option>
                </Field>
                <ErrorMessage name="category" component="div" className="error-text" />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-all ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 hover:shadow-lg"
              }`}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Media"}
            </button>
            {message && (
              <p className="text-center text-sm text-gray-600">{message}</p>
            )}
          </Form>
        )}
      </Formik>

      <UploadManager />
    </div>
  );
}

export default App;
