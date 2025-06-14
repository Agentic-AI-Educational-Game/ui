/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth, type User } from '../context/AuthContext';
import { fetchAllStudents } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Award, BarChart3, LogOut, Loader2, AlertCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentScoreDetailModal } from '../components/StudentScoreDetailModal';

// --- UPDATED StatCard: Smaller text and padding for a more compact look ---
const StatCard = React.memo(function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
    return (
        <Card className='p-2'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 pb-0">
                <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-1 sm:p-1 pt-0">
                <div className="text-xl sm:text-l font-bold">{value}</div>
            </CardContent>
        </Card>
    );
});
StatCard.displayName = "StatCard";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#a4de6c'];
const STUDENTS_PER_PAGE = 5;

export const TeacherDashboardScreen: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { logout, currentUser } = useAuth();
  // --- All hooks and logic are correct and remain the same ---
  useEffect(() => {
    const getStudents = async () => {
      try {
        const studentData = await fetchAllStudents();
        setStudents(studentData);
      } catch (err) {
        setError('Impossible de charger les données des élèves.');
      } finally {
        setIsLoading(false);
      }
    };
    getStudents();
  }, []);

  const { topStudent, classAverage, chartData } = useMemo(() => {
    if (students.length === 0) {
        return { topStudent: null, classAverage: 0, chartData: [{ name: 'Aucun élève', value: 1 }] };
    }
    const completedStudents = students.filter(s => s.status === 'Completed' && s.score);
    const top = completedStudents.length > 0
      ? completedStudents.reduce((max, student) => (student.score!.finalAverageScore > max.score!.finalAverageScore ? student : max), completedStudents[0]) : null;
    const totalScore = completedStudents.reduce((sum, student) => sum + student.score!.finalAverageScore, 0);
    const avg = completedStudents.length > 0 ? Math.round(totalScore / completedStudents.length) : 0;
    const scoreRanges = [
        { name: 'Pas commencé', value: 0 }, { name: '0-20', value: 0 }, { name: '21-40', value: 0 },
        { name: '41-60', value: 0 }, { name: '61-80', value: 0 }, { name: '81-100', value: 0 },
    ];
    students.forEach(student => {
        if (student.status !== 'Completed' || !student.score) { scoreRanges[0].value++; } 
        else {
            const score = student.score.finalAverageScore;
            if (score <= 20) scoreRanges[1].value++; else if (score <= 40) scoreRanges[2].value++;
            else if (score <= 60) scoreRanges[3].value++; else if (score <= 80) scoreRanges[4].value++;
            else scoreRanges[5].value++;
        }
    });
    return { topStudent: top, classAverage: avg, chartData: scoreRanges.filter(range => range.value > 0) };
  }, [students]);

 const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
  const paginatedStudents = students.slice((currentPage - 1) * STUDENTS_PER_PAGE, currentPage * STUDENTS_PER_PAGE);
  const handleNextPage = () => { setCurrentPage((prev) => Math.min(prev + 1, totalPages)); };
  const handlePrevPage = () => { setCurrentPage((prev) => Math.max(prev - 1, 1)); };

  // --- COMPLETE LOGIC: Loading and Error states ---
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-600">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="mt-4 text-lg">Chargement du tableau de bord...</p>
        </div>
    );
  }
  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-red-600">
            <AlertCircle className="h-12 w-12" />
            <p className="mt-4 text-lg font-semibold">{error}</p>
            <p>Veuillez rafraîchir la page.</p>
        </div>
    );
  }
 return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="w-full"
      >
        <header className="flex items-center justify-between mb-1">
          <div>
            {/* --- UPDATED: Title is hidden on mobile, visible on larger screens --- */}
            <h1 className="hidden sm:block text-2xl sm:text-3xl font-bold text-gray-800">Tableau de Bord Professeur</h1>
            <p className="text-sm sm:text-base text-gray-500">Bon retour, {currentUser?.username} !</p>
          </div>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </header>

        {/* --- UPDATED: Stats are in a single row on mobile, 3 columns on larger screens --- */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 mb-4">
            <StatCard title="Élèves" value={students.length} icon={Users} />
            <StatCard title="Meilleur(e)" value={topStudent ? topStudent.username : 'N/A'} icon={Award} />
            <StatCard title="Moyenne" value={`${classAverage}%`} icon={BarChart3} />
        </div>
        
        {/* --- UPDATED: Layout is a single column on mobile, a grid on larger screens --- */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-2">
            <Card className="lg:col-span-2">
                <CardHeader className="px-2">
                    <CardTitle className="text-base sm:text-lg">Répartition des Scores</CardTitle>
                </CardHeader>
                {/* --- UPDATED: Chart height is smaller on mobile --- */}
                <CardContent className="h-[120px] sm:h-[120px] w-full p-0">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} label>
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip wrapperClassName="!text-xs" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 flex flex-col">
                <CardHeader className="px-2">
                    <CardTitle className="text-base sm:text-lg">Progression des Élèves</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                    <th className="py-1 px-2">Élève</th>
                                    {/* --- UPDATED: Status column is hidden on mobile --- */}
                                    <th className="py-1 px-2 hidden sm:table-cell">Statut</th>
                                    <th className="py-1 px-2 text-center">Score</th>
                                    <th className="py-1 px-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {paginatedStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="py-2 px-2 whitespace-nowrap font-medium">{student.username}</td>
                                    {/* --- UPDATED: Status column is hidden on mobile --- */}
                                    <td className="py-2 px-2 whitespace-nowrap hidden sm:table-cell">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {student.status === 'Completed' ? 'Terminé' : 'Pas commencé'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-2 whitespace-nowrap font-bold text-center">
                                        {student.score ? `${student.score.finalAverageScore}` : '—'}
                                    </td>
                                    <td className="py-2 px-2 whitespace-nowrap text-right">
                                        {student.status === 'Completed' && (
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedStudent(student)}>
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
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-2 border-t">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs sm:text-sm font-medium">
                            Page {currentPage} / {totalPages}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </Card>
        </div>
      </motion.div>

      <StudentScoreDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </>
  );
};