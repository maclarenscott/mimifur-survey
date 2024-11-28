'use client';

import { useState, useEffect } from 'react';

export default function FormPage({ params }) {
  const [formId, setFormId] = useState(null); // Store resolved `formId`
  const [form, setForm] = useState(null); // Store form data
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Resolve `params` and extract `formId`
  useEffect(() => {
    (async () => {
      const resolvedParams = await params; // Await the params object
      setFormId(resolvedParams.formId); // Extract `formId` and store it
    })();
  }, [params]);

  // Fetch the form data once `formId` is available
  useEffect(() => {
    if (formId) {
      fetch(`/api/form/${formId}`)
        .then((res) => res.json())
        .then((data) => setForm(data))
        .catch((err) => console.error('Error fetching form:', err));
    }
  }, [formId]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data: formData }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!formId) return <div>Loading form ID...</div>;
  if (!form) return <div>Loading form...</div>;
  if (submitted) return <div>Thank you for your submission!</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-top justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{form.title}</h1>
        <form onSubmit={handleSubmit}>
          {Object.entries(form.fields).map(([name, field]) => (
            <div key={name} className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
