const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Result = require('../models/Result');
const User = require('../models/User');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const calculateGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
};

const gradeToPoint = (grade) => {
    switch(grade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        default: return 0.0;
    }
};

// Import results from CSV
exports.importResults = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload a CSV file', 400));
    }

    const results = [];
    const errors = [];
    let processedCount = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', async (row) => {
            try {
                processedCount++;
                
                // Validate required fields
                if (!row.studentId || !row.courseId || !row.score || !row.semester) {
                    errors.push({
                        row: processedCount,
                        error: 'Missing required fields',
                        data: row
                    });
                    return;
                }

                // Validate score
                const score = parseFloat(row.score);
                if (isNaN(score)) {
                    errors.push({
                        row: processedCount,
                        error: 'Score must be a number',
                        data: row
                    });
                    return;
                }

                if (score < 0 || score > 100) {
                    errors.push({
                        row: processedCount,
                        error: 'Score must be between 0 and 100',
                        data: row
                    });
                    return;
                }

                // Validate semester
                const semester = parseInt(row.semester);
                if (isNaN(semester) || semester < 1 || semester > 8) {
                    errors.push({
                        row: processedCount,
                        error: 'Semester must be between 1 and 8',
                        data: row
                    });
                    return;
                }

                // Check if student and course exist
                const [student, course] = await Promise.all([
                    User.findById(row.studentId),
                    Course.findById(row.courseId)
                ]);

                if (!student) {
                    errors.push({
                        row: processedCount,
                        error: 'Student not found',
                        data: row
                    });
                    return;
                }

                if (!course) {
                    errors.push({
                        row: processedCount,
                        error: 'Course not found',
                        data: row
                    });
                    return;
                }

                // Create result object
                results.push({
                    student: row.studentId,
                    course: row.courseId,
                    semester: semester,
                    score: score,
                    grade: calculateGrade(score),
                    recordedBy: req.user.id,
                    date: new Date()
                });
            } catch (err) {
                errors.push({
                    row: processedCount,
                    error: err.message,
                    data: row
                });
            }
        })
        .on('end', async () => {
            try {
                // Delete the uploaded file
                fs.unlinkSync(req.file.path);

                // Insert valid results
                const insertedResults = await Result.insertMany(results);

                res.status(200).json({
                    status: 'success',
                    imported: insertedResults.length,
                    errors: errors.length,
                    errorDetails: errors,
                    data: {
                        results: insertedResults
                    }
                });
            } catch (err) {
                return next(new AppError('Error processing results file', 500));
            }
        });
});

// Get results for a specific student with GPA calculation
exports.getStudentResults = catchAsync(async (req, res, next) => {
    const results = await Result.find({ student: req.params.studentId })
        .populate({
            path: 'course',
            select: 'code name credits'
        })
        .sort({ semester: 1, course: 1 });

    if (!results || results.length === 0) {
        return next(new AppError('No results found for this student', 404));
    }

    // Calculate GPA per semester
    const semesterResults = {};
    let cumulativeCredits = 0;
    let cumulativeGradePoints = 0;

    results.forEach(result => {
        if (!semesterResults[result.semester]) {
            semesterResults[result.semester] = {
                courses: [],
                totalCredits: 0,
                totalGradePoints: 0,
                gpa: 0
            };
        }

        const gradePoint = gradeToPoint(result.grade);
        const credits = result.course.credits;

        semesterResults[result.semester].courses.push({
            course: result.course,
            score: result.score,
            grade: result.grade,
            gradePoint,
            credits
        });

        semesterResults[result.semester].totalCredits += credits;
        semesterResults[result.semester].totalGradePoints += gradePoint * credits;
        
        // Calculate semester GPA
        semesterResults[result.semester].gpa = 
            semesterResults[result.semester].totalGradePoints / 
            semesterResults[result.semester].totalCredits;

        // Update cumulative totals
        cumulativeCredits += credits;
        cumulativeGradePoints += gradePoint * credits;
    });

    // Calculate CGPA (Cumulative GPA)
    const cgpa = cumulativeGradePoints / cumulativeCredits;

    res.status(200).json({
        status: 'success',
        data: {
            results,
            semesterResults,
            cgpa: cgpa.toFixed(2),
            totalCredits: cumulativeCredits
        }
    });
});

exports.getAllResults = catchAsync(async (req, res, next) => {
    try {
      const { page = 1, limit = 10, course, semester } = req.query;
      
      const query = {};
      if (course) query.course = course;
      if (semester) query.semester = parseInt(semester);
      
      const results = await Result.find(query)
        .skip((page - 1) * limit)
        .limit(limit);
        
      const total = await Result.countDocuments(query);
      
      res.status(200).json({
        status: 'success',
        results: results.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: { results }
      });
    } catch (error) {
      console.error('Error fetching results:', error);
      return next(new AppError('Failed to fetch results', 500));
    }
  });

// Get a single result
exports.getResult = catchAsync(async (req, res, next) => {
    const result = await Result.findById(req.params.id)
        .populate('student', 'name email')
        .populate('course', 'code name credits')
        .populate('recordedBy', 'name');
    
    if (!result) {
        return next(new AppError('No result found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            result
        }
    });
});

// Create a new result
exports.createResult = catchAsync(async (req, res, next) => {
    const { student, course, semester, score } = req.body;
    
    // Validate required fields
    if (!student || !course || !semester || !score) {
        return next(new AppError('Please provide all required fields', 400));
    }
    
    // Validate score
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
        return next(new AppError('Score must be a number between 0 and 100', 400));
    }
    
    // Validate semester
    const numericSemester = parseInt(semester);
    if (isNaN(numericSemester)) {
        return next(new AppError('Semester must be a number', 400));
    }
    
    // Check if student and course exist
    const [studentExists, courseExists] = await Promise.all([
        User.findById(student),
        Course.findById(course)
    ]);
    
    if (!studentExists) {
        return next(new AppError('Student not found', 404));
    }
    
    if (!courseExists) {
        return next(new AppError('Course not found', 404));
    }
    
    // Check if result already exists for this student and course in the same semester
    const existingResult = await Result.findOne({
        student,
        course,
        semester: numericSemester
    });
    
    if (existingResult) {
        return next(new AppError('Result already exists for this student in the specified course and semester', 400));
    }
    
    const grade = calculateGrade(numericScore);
    
    const newResult = await Result.create({
        student,
        course,
        semester: numericSemester,
        score: numericScore,
        grade,
        recordedBy: req.user.id,
        date: new Date()
    });
    
    res.status(201).json({
        status: 'success',
        data: {
            result: newResult
        }
    });
});

exports.updateResult = catchAsync(async (req, res, next) => {
    // 1. Validate the ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new AppError('Invalid result ID format', 400));
    }

    // 2. Get the update data and validate
    const { score, semester } = req.body;
    
    // Validate score if provided
    if (score !== undefined) {
        const numericScore = parseFloat(score);
        if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
            return next(new AppError('Score must be a number between 0 and 100', 400));
        }
        req.body.score = numericScore;
    }

    // Validate semester if provided
    if (semester !== undefined) {
        const numericSemester = parseInt(semester);
        if (isNaN(numericSemester) || numericSemester < 1 || numericSemester > 8) {
            return next(new AppError('Semester must be between 1 and 8', 400));
        }
        req.body.semester = numericSemester;
    }

    // 3. Perform the update
    const updatedResult = await Result.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    )
    .populate({
        path: 'student',
        select: 'name email'
    })
    .populate({
        path: 'course',
        select: 'code name'
    });

    if (!updatedResult) {
        return next(new AppError('No result found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            result: updatedResult
        }
    });
});

// Delete a result
exports.deleteResult = catchAsync(async (req, res, next) => {
    const result = await Result.findByIdAndDelete(req.params.id);
    
    if (!result) {
        return next(new AppError('No result found with that ID', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get result statistics
exports.getResultStatistics = catchAsync(async (req, res, next) => {
    try {
        const { course, semester } = req.query;
        
        const match = {};
        if (course) match.course = new mongoose.Types.ObjectId(course);
        if (semester) match.semester = parseInt(semester);
        
        const stats = await Result.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: "$score" },
                    minScore: { $min: "$score" },
                    maxScore: { $max: "$score" },
                    count: { $sum: 1 },
                    gradeDistribution: {
                        $push: "$grade"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    averageScore: { $round: ["$averageScore", 2] },
                    minScore: 1,
                    maxScore: 1,
                    count: 1,
                    gradeDistribution: {
                        A: { $size: { $filter: { input: "$gradeDistribution", as: "grade", cond: { $eq: ["$$grade", "A"] } } } },
                        B: { $size: { $filter: { input: "$gradeDistribution", as: "grade", cond: { $eq: ["$$grade", "B"] } } } },
                        C: { $size: { $filter: { input: "$gradeDistribution", as: "grade", cond: { $eq: ["$$grade", "C"] } } } },
                        D: { $size: { $filter: { input: "$gradeDistribution", as: "grade", cond: { $eq: ["$$grade", "D"] } } } },
                        F: { $size: { $filter: { input: "$gradeDistribution", as: "grade", cond: { $eq: ["$$grade", "F"] } } } }
                    }
                }
            }
        ]);
        
        res.status(200).json({
            status: 'success',
            data: {
                statistics: stats[0] || null
            }
        });
    } catch (error) {
        console.error('Error in getResultStatistics:', error);
        return next(new AppError('Failed to fetch result statistics', 500));
    }
});