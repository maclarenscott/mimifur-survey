'use client';

import { useState, useEffect } from 'react';

export default function SurveyPage({ params }) {
    const [surveyId, setSurveyId] = useState(null);
    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState({});
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
  
    useEffect(() => {
      (async () => {
        const resolvedParams = await params;
        setSurveyId(resolvedParams.surveyId);
      })();
    }, [params]);
  
    useEffect(() => {
      if (surveyId) {
        fetch(`/api/survey/${surveyId}`)
          .then((res) => res.json())
          .then((data) => {
            // Sorting logic
            if (data && data.sections) {
              // Sort sections
              data.sections.sort((a, b) => a.ordering - b.ordering);
  
              data.sections.forEach((section) => {
                if (section.questions) {
                  // Sort questions within sections
                  section.questions.sort((a, b) => a.ordering - b.ordering);
  
                  section.questions.forEach((question) => {
                    if (question.options) {
                      // Sort options within questions
                      question.options.sort((a, b) => a.ordering - b.ordering);
                    }
                  });
                }
              });
            }
            setSurvey(data);
          })
          .catch((err) => console.error('Error fetching survey:', err));
      }
    }, [surveyId]);

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextSection = (e) => {
    e.preventDefault();
    if (currentSectionIndex < survey.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, responses }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error('Submission error:', errorData);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  if (!surveyId) return <div className="text-center mt-10">Loading survey ID...</div>;
  if (!survey) return <div className="text-center mt-10">Loading survey...</div>;
  if (submitted)
    return (
        <div className="max-w-md mx-auto p-6 rounded-md shadow-md mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">{`Thank you!`}</h2>
          <p>{`Your responses have been recorded.`}</p>
        </div>
      );

  const currentSection = survey.sections[currentSectionIndex];

  // Calculate progress percentage
  const progress = ((currentSectionIndex + 1) / survey.sections.length) * 100;

  return (
    
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
      <div className="mt-3 w-full max-w-3xl bg-white rounded-md shadow-md p-6">
        {/* Survey Title and Description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">{survey.title}</h1>
          {survey.description && <p className="text-center text-gray-600">{survey.description}</p>}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Current Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">{currentSection.title}</h2>
          {currentSection.description && (
            <p className="mb-6 text-gray-600">{currentSection.description}</p>
          )}
          <form onSubmit={handleNextSection}>
            {currentSection.questions.map((question) => (
              <div key={question.id} className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderQuestion(question, responses[question.id], handleChange)}
              </div>
            ))}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentSectionIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="bg-gray-500 text-white font-medium py-2 px-6 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300 transition"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-500 text-white font-medium py-2 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 ml-auto transition"
              >
                {currentSectionIndex < survey.sections.length - 1 ? 'Next' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function renderQuestion(question, value, handleChange) {
  switch (question.type) {
    case 'text':
    case 'number':
    case 'date':
    case 'email':
      return (
        <input
          type={question.type}
          value={value || ''}
          onChange={(e) => handleChange(question.id, e.target.value)}
          required={question.required}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      );
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => handleChange(question.id, e.target.value)}
          required={question.required}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows="4"
        ></textarea>
      );
    case 'radio':
      return (
        <div className="flex justify-between">
          {question.options.map((option) => (
            <label key={option.id} className="inline-flex items-center">
              <input
                type="radio"
                name={question.id}
                value={option.value || option.text}
                checked={value === (option.value || option.text) || false}
                onChange={() => handleChange(question.id, option.value || option.text)}
                required={question.required}
                className="form-radio text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{option.text}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex justify-between">
          {question.options.map((option) => (
            <label key={option.id} className="inline-flex items-center">
              <input
                type="checkbox"
                name={question.id}
                value={option.value || option.text}
                checked={value?.includes(option.value || option.text)}
                onChange={(e) => {
                  const newValue = value || [];
                  if (e.target.checked) {
                    handleChange(question.id, [...newValue, option.value || option.text]);
                  } else {
                    handleChange(
                      question.id,
                      newValue.filter((v) => v !== (option.value || option.text))
                    );
                  }
                }}
                className="form-checkbox text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{option.text}</span>
            </label>
          ))}
        </div>
      );
    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(question.id, e.target.value)}
          required={question.required}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.options.map((option) => (
            <option key={option.id} value={option.value || option.text}>
              {option.text}
            </option>
          ))}
        </select>
      );
    default:
      return null;
  }
}
