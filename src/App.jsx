import React, { useState } from 'react';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import MeshTopology from './pages/MeshTopology';
import PQCSecurity from './pages/PQCSecurity';
import DarkNetwork from './pages/DarkNetwork';
import Benchmark from './pages/Benchmark';
import LogsMonitoring from './pages/LogsMonitoring';
import TransactionDemo from './pages/TransactionDemo';
import AddNewClient from './pages/AddNewClient';


export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [globalError, setGlobalError] = useState(false);

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'topology':
        return <MeshTopology />;
      case 'pqc':
        return <PQCSecurity />;
      case 'dark-network':
        return <DarkNetwork />;
      case 'benchmark':
        return <Benchmark />;
      case 'logs':
        return <LogsMonitoring />;
      case 'transaction':
        return <TransactionDemo />;
      case 'add-client':
        return <AddNewClient />;

      default:
        return <Overview />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      globalError={globalError}
    >
      {renderCurrentPage()}
    </Layout>
  );
}
