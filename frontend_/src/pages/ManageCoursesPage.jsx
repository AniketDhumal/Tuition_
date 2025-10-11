import React, { useState } from "react";

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([
    { code: "MATH101", name: "Mathematics", credits: 4, duration: 12 },
    { code: "SCI102", name: "Science", credits: 3, duration: 10 },
  ]);

  const [newCourse, setNewCourse] = useState({ code: "", name: "", credits: "", duration: "" });

  const addCourse = (e) => {
    e.preventDefault();
    if (newCourse.name.trim()) {
      setCourses([...courses, newCourse]);
      setNewCourse({ code: "", name: "", credits: "", duration: "" });
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Manage Courses</h1>

      <form className="row g-3 mb-4" onSubmit={addCourse}>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Code"
            value={newCourse.code}
            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Course Name"
            value={newCourse.name}
            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Credits"
            value={newCourse.credits}
            onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Weeks"
            value={newCourse.duration}
            onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100">Add</button>
        </div>
      </form>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Credits</th>
            <th>Duration (weeks)</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={i}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.credits}</td>
              <td>{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
