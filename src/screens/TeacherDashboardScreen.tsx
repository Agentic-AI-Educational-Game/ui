/* eslint-disable @typescript-eslint/no-explicit-any */
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

// --- OPTIMIZATION: Memoize the StatCard to prevent unnecessary re-renders ---
const StatCard = React.memo(function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
    return (
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

  // --- COMPLETE LOGIC: useEffect to fetch student data ---
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

  // --- COMPLETE LOGIC: useMemo to calculate all dashboard statistics ---
  const { topStudent, classAverage, chartData } = useMemo(() => {
    if (students.length === 0) {
        return {
            topStudent: null,
            classAverage: 0,
            chartData: [{ name: 'Aucun élève', value: 1 }]
        };
    }

    const completedStudents = students.filter(s => s.status === 'Completed' && s.score);
    
    // Find top student, handle case where no one has completed the quiz
    const top = completedStudents.length > 0
      ? completedStudents.reduce((max, student) => 
          (student.score!.finalAverageScore > max.score!.finalAverageScore ? student : max), 
          completedStudents[0]
        )
      : null;

    // Calculate class average
    const totalScore = completedStudents.reduce((sum, student) => sum + student.score!.finalAverageScore, 0);
    const avg = completedStudents.length > 0 ? Math.round(totalScore / completedStudents.length) : 0;
    
    // Prepare data for the chart
    const scoreRanges = [
        { name: 'Pas commencé', value: 0 },
        { name: '0-20', value: 0 },
        { name: '21-40', value: 0 },
        { name: '41-60', value: 0 },
        { name: '61-80', value: 0 },
        { name: '81-100', value: 0 },
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

    return { 
        topStudent: top, 
        classAverage: avg,
        chartData: scoreRanges.filter(range => range.value > 0)
    };
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
        className="w-full h-full max-w-7xl mx-auto flex flex-col p-2 sm:p-4"
      >
        <header className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tableau de Bord Professeur</h1>
            <p className="text-gray-500">Bon retour, {currentUser?.username} !</p>
          </div>
          <Button onClick={logout} variant="outline" className="mt-4 sm:mt-0">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </header>

        <div className="flex-grow overflow-y-auto pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Élèves" value={students.length} icon={Users} />
                <StatCard title="Meilleur(e) Élève" value={topStudent ? topStudent.username : 'N/A'} icon={Award} />
                <div className="col-span-2 sm:col-span-1">
                    <StatCard title="Moyenne Classe" value={`${classAverage}%`} icon={BarChart3} />
                </div>
            </div>
            
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Répartition des Scores</CardTitle>
                        <CardDescription>Performance par tranche de score.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] sm:h-[300px] w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {chartData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 flex flex-col">
                    <CardHeader>
                        <CardTitle>Progression des Élèves</CardTitle>
                        <CardDescription>Cliquez sur un élève pour voir les détails.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                        <th className="py-3 px-2 sm:px-4">Élève</th>
                                        <th className="py-3 px-2 sm:px-4">Statut</th>
                                        <th className="py-3 px-2 sm:px-4 text-center">Score</th>
                                        <th className="py-3 px-2 sm:px-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {paginatedStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td className="py-3 px-2 sm:px-4 whitespace-nowrap text-sm font-medium">{student.username}</td>
                                        <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {student.status === 'Completed' ? 'Terminé' : 'Pas commencé'}
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
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>
                            <span className="text-sm font-medium">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
      </motion.div>

      <StudentScoreDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </>
  );
};