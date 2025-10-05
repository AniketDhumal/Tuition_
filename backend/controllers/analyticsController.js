// controllers/analyticsController.js
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const Result = require('../models/Result');
const mongoose = require('mongoose');

exports.getDownloadsData = async (req, res) => {
    try {
        // Get downloads data for the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - 30);
        
        const data = await Resource.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: date } 
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    downloads: { $sum: "$downloadCount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        const labels = data.map(item => item._id);
        const values = data.map(item => item.downloads);
        
        res.json({ labels, values });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getResourceTypesData = async (req, res) => {
    try {
        const data = await Resource.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const labels = data.map(item => item._id.toUpperCase());
        const values = data.map(item => item.count);
        
        res.json({ labels, values });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCoursePopularityData = async (req, res) => {
    try {
        const data = await Course.aggregate([
            {
                $lookup: {
                    from: "resources",
                    localField: "_id",
                    foreignField: "course",
                    as: "resources"
                }
            },
            {
                $project: {
                    name: 1,
                    code: 1,
                    resourceCount: { $size: "$resources" },
                    downloadCount: { $sum: "$resources.downloadCount" }
                }
            },
            { $sort: { resourceCount: -1 } },
            { $limit: 5 }
        ]);
        
        const labels = data.map(item => `${item.code} - ${item.name}`);
        const resourceCounts = data.map(item => item.resourceCount);
        const downloadCounts = data.map(item => item.downloadCount);
        
        res.json({ labels, resourceCounts, downloadCounts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getGradeDistributionData = async (req, res) => {
    try {
        const data = await Result.aggregate([
            {
                $group: {
                    _id: "$grade",
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        const labels = data.map(item => item._id);
        const values = data.map(item => item.count);
        
        res.json({ labels, values });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPerformanceData = async (req, res) => {
    try {
        // Get performance data for the last 4 semesters
        const semesters = [1, 2, 3, 4];
        const courses = await Course.find().limit(3);
        
        const datasets = await Promise.all(courses.map(async course => {
            const data = await Promise.all(semesters.map(async semester => {
                const result = await Result.aggregate([
                    { 
                        $match: { 
                            course: mongoose.Types.ObjectId(course._id),
                            semester: semester 
                        } 
                    },
                    {
                        $group: {
                            _id: null,
                            avgScore: { $avg: "$score" }
                        }
                    }
                ]);
                
                return result.length > 0 ? Math.round(result[0].avgScore) : 0;
            }));
            
            return {
                label: `${course.code} - ${course.name}`,
                data: data,
                backgroundColor: getRandomColor(),
                borderColor: getRandomColor()
            };
        }));
        
        res.json({ 
            labels: semesters.map(s => `Semester ${s}`),
            datasets 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}