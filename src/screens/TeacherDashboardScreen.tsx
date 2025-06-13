/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth, type User } from '../context/AuthContext';
import { fetchAllStudents } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Award, BarChart3, LogOut, Loader2, AlertCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentScoreDetailModal } from '../components/StudentScoreDetailModal';

// --- (No changes to this helper component) ---
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#a4de6c'];
const STUDENTS_PER_PAGE = 5; // --- NEW: Constant for pagination ---

export const TeacherDashboardScreen: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // --- NEW: State for pagination ---
  const { logout, currentUser } = useAuth();

  useEffect(() => {
    const getStudents = async () => {
      try {
        const studentData = await fetchAllStudents();
        setStudents(studentData);
      } catch (err) {
        setError('Failed to load student data.');
      } finally {
        setIsLoading(false);
      }
    };
    getStudents();
  }, []);

  // --- (No changes to the memoized calculations) ---
  const { topStudent, classAverage, chartData } = useMemo(() => {
    const completedStudents = students.filter(s => s.status === 'Completed' && s.score);
    const top = completedStudents.reduce((max, student) => 
      (student.score!.finalAverageScore > max.score!.finalAverageScore ? student : max), 
      completedStudents[0]
    );
    const totalScore = completedStudents.reduce((sum, student) => sum + student.score!.finalAverageScore, 0);
    const avg = completedStudents.length > 0 ? Math.round(totalScore / completedStudents.length) : 0;
    const scoreRanges = [
        { name: 'Not Started', value: 0 }, { name: '0-20', value: 0 }, { name: '21-40', value: 0 },
        { name: '41-60', value: 0 }, { name: '61-80', value: 0 }, { name: '81-100', value: 0 },
    ];
    students.forEach(student => {
        if (student.status !== 'Completed' || !student.score) {
            scoreRanges[0].value++;
        } else {
            const score = student.score.finalAverageScore;
            if (score <= 20) scoreRanges[1].value++;
            else if (score <= 40) scoreRanges[2].value++;
            else if (score <= 60) scoreRanges[3].value++;
            else if (score <= 80) scoreRanges[4].value++;
            else scoreRanges[5].value++;
        }
    });
    return { topStudent: top, classAverage: avg, chartData: scoreRanges.filter(range => range.value > 0) };
  }, [students]);

  // --- NEW: Pagination Logic ---
  const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
  const paginatedStudents = students.slice(
      (currentPage - 1) * STUDENTS_PER_PAGE,
      currentPage * STUDENTS_PER_PAGE
  );
  
  const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  // --- END: Pagination Logic ---


  // --- (No changes to loading/error states) ---
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-600">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="mt-4 text-lg">Loading Dashboard...</p>
        </div>
    );
  }
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-red-600">
            <AlertCircle className="h-12 w-12" />
            <p className="mt-4 text-lg font-semibold">{error}</p>
            <p>Please try refreshing the page.</p>
        </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl mx-auto p-2 sm:p-4">
        {/* Header - (No changes here) */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-500">Welcome back, {currentUser?.username}!</p>
          </div>
          <Button onClick={logout} variant="outline" className="mt-4 sm:mt-0">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>

        {/* --- UPDATED: Responsive Summary Cards --- */}
        {/* Now a 2x2 grid on mobile, and 3-col on larger screens */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-6">
          <StatCard title="Total Students" value={students.length} icon={Users} />
          <StatCard title="Top Student" value={topStudent ? topStudent.username : 'N/A'} icon={Award} />
          {/* This card will wrap to the next line on mobile, creating a 2x2 feel */}
          <StatCard title="Class Average" value={`${classAverage}%`} icon={BarChart3} />
        </div>
        
        {/* --- UPDATED: Main Content Grid for Responsiveness --- */}
        {/* On mobile, it's a single column (flex-col). On larger screens (lg), it becomes a grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>Performance across score ranges.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Student List */}
            <Card className="lg:col-span-3 flex flex-col">
                <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>A list of all students and their status.</CardDescription>
                </CardHeader>
                {/* Made content grow to push footer down */}
                <CardContent className="flex-grow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                    <th className="py-3 px-2 sm:px-4">Student</th>
                                    <th className="py-3 px-2 sm:px-4">Status</th>
                                    <th className="py-3 px-2 sm:px-4 text-center">Score</th>
                                    <th className="py-3 px-2 sm:px-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {/* --- UPDATED: Use paginatedStudents here --- */}
                            {paginatedStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap text-sm font-medium">{student.username}</td>
                                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap text-sm font-bold text-center">
                                        {student.score ? `${student.score.finalAverageScore}` : '—'}
                                    </td>
                                    <td className="py-3 px-2 sm:px-4 whitespace-nowrap text-right">
                                        {student.status === 'Completed' && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedStudent(student)}>
                                                <Eye className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {/* --- NEW: Pagination Footer --- */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </Card>
        </div>
      </motion.div>

      {/* The Modal for displaying score details (No changes here) */}
      <StudentScoreDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </>
  );
};