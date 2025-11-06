import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getCreatedFilesThisWeek, getModifiedFilesThisWeek, fetchFilesCreatedByDay , fetchFilesModifiedByDay } from '../../Services/FileService';
import './MainAnalytics.css'
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import MessageBubble from '../MessageBubble/MessageBubble';


const MainAnalytics = () => {
  const [createdFiles, setCreatedFiles] = useState(0);
  const [modifiedFiles, setModifiedFiles] = useState(0);
  const [fileData, setFileData] = useState([]);
  const [modifiedFileData, setModifiedFileData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const created = await getCreatedFilesThisWeek();
        const modified = await getModifiedFilesThisWeek();
        console.log('Created Files:', created); // Vérifiez la valeur
        console.log('Modified Files:', modified); // Vérifiez la valeur
        setCreatedFiles(created);
        setModifiedFiles(modified);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        alert('Une erreur est survenue lors du chargement des statistiques.');
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const createdData = await fetchFilesCreatedByDay();
        const modifiedData = await fetchFilesModifiedByDay();
        console.log("Données brutes (créées) :", createdData);
        console.log("Données brutes (modifiées) :", modifiedData);
  
        // Générer les 7 derniers jours avec initialisation des valeurs à 0
        let last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return {
            day: format(date, "EEEE", { locale: fr }), // "lundi", "mardi", ...
            date: format(date, "yyyy-MM-dd"),
            totalFilesCreated: 0, 
            totalFilesModified: 0,
          };
        }).reverse();
  
        // Remplir les données créées
        createdData.forEach(({ _id, count }) => {
          let dayObj = last7Days.find((d) => d.date === _id);
          if (dayObj) {
            dayObj.totalFilesCreated = count;
          }
        });
  
        // Remplir les données modifiées
        modifiedData.forEach(({ _id, count }) => {
          let dayObj = last7Days.find((d) => d.date === _id);
          if (dayObj) {
            dayObj.totalFilesModified = count;
          }
        });
  
        console.log("Données finales formatées :", last7Days);
        setFileData(last7Days);
      } catch (error) {
        console.error("Erreur lors du chargement des données d'analytique", error);
      }
    };
    fetchData();
  }, []);
  

  const statsData = [
    { title: 'Fichiers créés cette semaine', value: createdFiles },
    { title: 'Fichiers modifiés cette semaine', value: modifiedFiles },
  ];

  // Données fictives pour le graphique
  const chartData = fileData.map((day) => ({
    name: day.day.charAt(0).toUpperCase() + day.day.slice(1), // "Lundi", "Mardi", ...
    createdFiles: day.totalFilesCreated,  
    modifiedFiles: day.totalFilesModified,
}));
  return (
    <div className="mainAnalytics-container">
      <h1 className="analytics-title">My Analytics</h1>
      <div className='mainAnalytics'>

        {/* Cartes des statistiques */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>

            </div>
          ))}
        </div>

        {/* Graphique des tendances */}
        <div className="chart-container">
          <h2>Developers activity this week</h2>
          <LineChart
            width={800}
            height={400}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="createdFiles" stroke="#8884d8" />
            <Line type="monotone" dataKey="modifiedFiles" stroke="#82ca9d" />

          </LineChart>
        </div>
       
      </div>
      <MessageBubble />
    </div>
  )
}

export default MainAnalytics
