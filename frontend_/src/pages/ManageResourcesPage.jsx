import React, { useState } from "react";

export default function ManageResourcesPage() {
  const [resources, setResources] = useState([
    { title: "Algebra Notes", type: "PDF", course: "Math", date: "2025-10-01" },
    { title: "Science Video Lecture", type: "Video", course: "Science", date: "2025-10-03" },
  ]);

  const [newResource, setNewResource] = useState({ title: "", type: "", course: "" });

  const addResource = (e) => {
    e.preventDefault();
    if (newResource.title.trim()) {
      setResources([
        ...resources,
        { ...newResource, date: new Date().toISOString().split("T")[0] },
      ]);
      setNewResource({ title: "", type: "", course: "" });
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Manage Resources</h1>

      <form className="row g-3 mb-4" onSubmit={addResource}>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={newResource.title}
            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={newResource.type}
            onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Course"
            value={newResource.course}
            onChange={(e) => setNewResource({ ...newResource, course: e.target.value })}
            required
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-success w-100">Add</button>
        </div>
      </form>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Course</th>
            <th>Date Added</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r, i) => (
            <tr key={i}>
              <td>{r.title}</td>
              <td>{r.type}</td>
              <td>{r.course}</td>
              <td>{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
