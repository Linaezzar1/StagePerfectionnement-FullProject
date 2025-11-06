import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts';
import './Analytics.css';
import { getCreatedFilesStats , getModifiedFilesStats } from '../../../Services/FileService';


const Analytics = () => {

  const [createdFilesStats, setCreatedFilesStats] = useState([]);
  const [modifiedFilesStats, setModifiedFilesStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const createdFiles = await getCreatedFilesStats();
      const modifiedFiles = await getModifiedFilesStats();
      setCreatedFilesStats(createdFiles);
      setModifiedFilesStats(modifiedFiles);
    };

    fetchStats();
  }, []);

  const createdFilesData = createdFilesStats.map(stat => stat.totalFiles);
  const modifiedFilesData = modifiedFilesStats.map(stat => stat.totalFiles);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options = {
    chart: {
      id: 'files-stats-bar',
    },
    xaxis: {
      categories: months,
    },
  };

  const series = [
    {
      name: 'Created Files',
      data: createdFilesData,
    },
    {
      name: 'Modified Files',
      data: modifiedFilesData,
    },
  ];


  return (
    <div className="analytics-container">
      <div className="stats">
        <div className="stat-item">
          <h3>Created files / month</h3>
          <p>{createdFilesData.reduce((a, b) => a + b, 0)}</p> {/* Total des fichiers créés */}
        </div>
        <div className="stat-item">
          <h3>Modified files / month </h3>
          <p>{modifiedFilesData.reduce((a, b) => a + b, 0)}</p> {/* Total des fichiers modifiés */}
        </div>
      </div>

      <div className="charts">
        <h2>Files Activity</h2>
        <ReactApexChart options={options} series={series} type="bar" width="100%" height="300" />
      </div>
    </div>
  )
}

export default Analytics
